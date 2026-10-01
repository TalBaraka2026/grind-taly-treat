import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck,
  XCircle,
  Clock,
  Ticket,
  Camera,
  X,
} from 'lucide-react';

const CASHIER_PIN = '1234';

export default function CashierPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const qrToken = searchParams.get('token') || '';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const jsQrRef = useRef(null);
  const detectorRef = useRef(null);

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [token, setToken] = useState(qrToken);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loadingCamera, setLoadingCamera] = useState(false);

  const stopScanner = () => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setLoadingCamera(false);
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const extractToken = (value) => {
    try {
      const url = new URL(value);
      const urlToken = url.searchParams.get('token');

      if (urlToken) {
        return urlToken;
      }
    } catch {
      // QR يحتوي على الكود مباشرة
    }

    return value.trim();
  };

  const loadJsQR = () => {
    return new Promise((resolve, reject) => {
      if (window.jsQR) {
        jsQrRef.current = window.jsQR;
        resolve(window.jsQR);
        return;
      }

      const existing = document.querySelector(
        'script[data-jsqr="true"]'
      );

      if (existing) {
        existing.addEventListener('load', () => {
          if (window.jsQR) {
            jsQrRef.current = window.jsQR;
            resolve(window.jsQR);
          } else {
            reject(new Error('jsQR unavailable'));
          }
        });

        existing.addEventListener('error', () => {
          reject(new Error('jsQR failed'));
        });

        return;
      }

      const script = document.createElement('script');

      script.src =
        'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';

      script.async = true;
      script.setAttribute('data-jsqr', 'true');

      script.onload = () => {
        if (window.jsQR) {
          jsQrRef.current = window.jsQR;
          resolve(window.jsQR);
        } else {
          reject(new Error('jsQR unavailable'));
        }
      };

      script.onerror = () => {
        reject(new Error('jsQR failed'));
      };

      document.head.appendChild(script);
    });
  };

  const checkCoupon = async (couponToken) => {
    const cleanToken = couponToken?.trim();

    if (!cleanToken) return;

    setChecking(true);
    setResult(null);

    try {
      const res = await base44.functions.invoke('activateCoupon', {
        token: cleanToken,
      });

      setResult({
        status: res.data.status,
        coupon: res.data,
      });
    } catch {
      setResult({
        status: 'not_found',
        coupon: null,
      });
    } finally {
      setChecking(false);
    }
  };

  const scanWithBarcodeDetector = async () => {
    if (!detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;

    try {
      if (video.readyState >= 2) {
        const codes = await detectorRef.current.detect(video);

        if (codes.length > 0 && codes[0].rawValue) {
          const scannedToken = extractToken(codes[0].rawValue);

          stopScanner();

          setToken(scannedToken);

          await checkCoupon(scannedToken);

          return;
        }
      }
    } catch {
      // نكمل المحاولة
    }

    if (scanning) {
      scanTimerRef.current = setTimeout(
        scanWithBarcodeDetector,
        300
      );
    }
  };

  const scanWithJsQR = async () => {
    if (!videoRef.current || !canvasRef.current || !jsQrRef.current) {
      return;
    }

    if (!scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const context = canvas.getContext('2d', {
      willReadFrequently: true,
    });

    if (video.readyState >= 2) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width && height) {
        canvas.width = width;
        canvas.height = height;

        context.drawImage(video, 0, 0, width, height);

        const imageData = context.getImageData(
          0,
          0,
          width,
          height
        );

        const code = jsQrRef.current(
          imageData.data,
          imageData.width,
          imageData.height,
          {
            inversionAttempts: 'attemptBoth',
          }
        );

        if (code?.data) {
          const scannedToken = extractToken(code.data);

          stopScanner();

          setToken(scannedToken);

          await checkCoupon(scannedToken);

          return;
        }
      }
    }

    scanTimerRef.current = setTimeout(scanWithJsQR, 300);
  };

  const startScanner = async () => {
    setCameraError('');
    setLoadingCamera(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('camera-not-supported');
      }

      /*
       * تشغيل الكاميرا أولاً
       */
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error('video-not-ready');
      }

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.muted = true;

      await videoRef.current.play();

      setLoadingCamera(false);
      setScanning(true);

      /*
       * لو المتصفح يدعم BarcodeDetector
       * نستخدمه مباشرة بدون أي مكتبة خارجية
       */
      if ('BarcodeDetector' in window) {
        try {
          let formats = ['qr_code'];

          if (BarcodeDetector.getSupportedFormats) {
            const supported =
              await BarcodeDetector.getSupportedFormats();

            if (supported.includes('qr_code')) {
              formats = ['qr_code'];
            }
          }

          detectorRef.current = new BarcodeDetector({
            formats,
          });

          setTimeout(() => {
            scanWithBarcodeDetector();
          }, 500);

          return;
        } catch {
          detectorRef.current = null;
        }
      }

      /*
       * لو BarcodeDetector غير متوفر
       * نستخدم jsQR كبديل
       */
      try {
        await loadJsQR();

        setTimeout(() => {
          scanWithJsQR();
        }, 500);
      } catch {
        stopScanner();

        setCameraError(
          'الكاميرا تعمل، لكن قارئ QR غير متوفر في هذا المتصفح. جرّب فتح الموقع من Google Chrome.'
        );
      }
    } catch (error) {
      stopScanner();

      if (error?.name === 'NotAllowedError') {
        setCameraError(
          'الكاميرا مرفوضة من المتصفح. اسمح للمتصفح باستخدام الكاميرا ثم حاول مرة أخرى.'
        );
      } else if (error?.name === 'NotFoundError') {
        setCameraError(
          'لم يتم العثور على كاميرا في الجهاز.'
        );
      } else if (error?.name === 'NotReadableError') {
        setCameraError(
          'الكاميرا مستخدمة حاليًا بواسطة تطبيق أو نافذة أخرى.'
        );
      } else if (error?.message === 'camera-not-supported') {
        setCameraError(
          'المتصفح الحالي لا يدعم تشغيل الكاميرا. افتح الموقع باستخدام Google Chrome.'
        );
      } else {
        setCameraError(
          'تعذر تشغيل الكاميرا. تأكد من السماح للمتصفح باستخدام الكاميرا ثم حاول مرة أخرى.'
        );
      }
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();

    if (pin !== CASHIER_PIN) {
      setPinError('رمز غير صحيح');
      return;
    }

    setUnlocked(true);
    setPinError('');

    if (qrToken) {
      await checkCoupon(qrToken);
    }
  };

  const handleConfirm = async () => {
    if (!result?.coupon) return;

    setConfirming(true);

    try {
      const res = await base44.functions.invoke('redeemCoupon', {
        token: result.coupon.token,
      });

      if (res.data.success) {
        navigate('/coupon-success', {
          state: {
            coupon: res.data.coupon,
          },
        });
      } else {
        setResult({
          status: res.data.coupon.status,
          coupon: res.data.coupon,
        });
      }
    } catch {
      setResult({
        status: 'not_found',
        coupon: null,
      });
    } finally {
      setConfirming(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#160D08] flex items-center justify-center px-6">
        <form
          onSubmit={handlePinSubmit}
          className="max-w-sm w-full rounded-3xl bg-[#1E120C] ring-1 ring-white/10 p-8 flex flex-col items-center gap-4 text-center"
        >
          <ShieldCheck className="w-10 h-10 text-[#E8622D]" />

          <p className="text-[#F3E9DC] text-lg font-bold">
            دخول الكاشير
          </p>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="رمز الدخول"
            className="w-full rounded-full bg-[#241610] ring-1 ring-white/5 text-[#F3E9DC] text-center py-3 placeholder:text-[#8A7862] focus:outline-none focus:ring-[#E8622D]"
          />

          {pinError && (
            <p className="text-[#E8622D] text-sm">
              {pinError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5"
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#160D08] px-6 py-10 flex flex-col items-center">
      <div className="max-w-sm w-full flex flex-col gap-5">

        <p className="text-[#F3E9DC] text-lg font-bold text-center">
          التحقق من الكوبون
        </p>

        {/* الكود أولاً */}
        <input
          dir="ltr"
          value={token}
          onChange={(e) =>
            setToken(e.target.value.toUpperCase())
          }
          placeholder="GH-XXXXXX"
          className="w-full rounded-full bg-[#241610] ring-1 ring-white/5 text-[#F3E9DC] text-center tracking-widest py-4 placeholder:text-[#8A7862] focus:outline-none focus:ring-[#E8622D]"
        />

        {/* الكاميرا ثانيًا */}
        <button
          type="button"
          onClick={startScanner}
          disabled={scanning || loadingCamera}
          className="w-full rounded-full bg-[#2A1810] ring-1 ring-[#E8622D]/50 text-[#F3E9DC] font-semibold py-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera className="w-5 h-5 text-[#E8622D]" />

          {loadingCamera
            ? 'جاري فتح الكاميرا...'
            : scanning
            ? 'جاري مسح QR...'
            : 'مسح QR بالكاميرا'}
        </button>

        {cameraError && (
          <div className="rounded-2xl bg-[#2A1810] ring-1 ring-red-500/20 p-4 text-center">
            <p className="text-red-400 text-sm">
              {cameraError}
            </p>
          </div>
        )}

        {/* التحقق آخر شيء */}
        <button
          type="button"
          onClick={() => checkCoupon(token)}
          disabled={checking || !token.trim()}
          className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-4 disabled:opacity-50"
        >
          {checking ? 'جاري التحقق...' : 'تحقق'}
        </button>

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* شاشة الكاميرا */}
        {scanning && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-5">
            <div className="w-full max-w-md flex flex-col gap-4">

              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">
                  مسح QR الكوبون
                </p>

                <button
                  type="button"
                  onClick={stopScanner}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-black ring-2 ring-[#E8622D]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[3/4] object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-white rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                </div>
              </div>

              <p className="text-white/80 text-sm text-center">
                وجّه الكاميرا نحو QR الموجود على كوبون العميل
              </p>

            </div>
          </div>
        )}

        {result && (
          <div className="rounded-3xl bg-[#1E120C] ring-1 ring-white/10 p-6 flex flex-col items-center text-center gap-3">

            {result.status === 'active' && (
              <>
                <ShieldCheck className="w-10 h-10 text-[#4ADE80]" />

                <p className="text-[#4ADE80] font-bold text-lg">
                  الكوبون صالح
                </p>

                <p className="text-[#E8622D] text-3xl font-bold">
                  خصم 15%
                </p>

                <p
                  dir="ltr"
                  className="text-[#8A7862] text-sm tracking-wider"
                >
                  {result.coupon.token}
                </p>

                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="mt-2 w-full rounded-full bg-[#4ADE80] text-[#0F1B12] font-semibold py-3.5 disabled:opacity-60"
                >
                  {confirming
                    ? 'جاري التأكيد...'
                    : 'تأكيد استخدام الخصم'}
                </button>
              </>
            )}

            {result.status === 'expired' && (
              <>
                <Clock className="w-10 h-10 text-[#B8875A]" />

                <p className="text-[#B8875A] font-bold text-lg">
                  الكوبون منتهي الصلاحية
                </p>
              </>
            )}

            {result.status === 'used' && (
              <>
                <Ticket className="w-10 h-10 text-[#B8875A]" />

                <p className="text-[#B8875A] font-bold text-lg">
                  تم استخدام هذا الكوبون مسبقًا
                </p>
              </>
            )}

            {result.status === 'not_found' && (
              <>
                <XCircle className="w-10 h-10 text-[#EF4444]" />

                <p className="text-[#EF4444] font-bold text-lg">
                  كوبون غير موجود
                </p>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
