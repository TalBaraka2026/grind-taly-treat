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
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const detectorRef = useRef(null);
  const scanningLockRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [token, setToken] = useState(qrToken);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
    scanningLockRef.current = false;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const extractToken = (decodedText) => {
    try {
      const url = new URL(decodedText);

      const urlToken = url.searchParams.get('token');

      if (urlToken) {
        return urlToken;
      }
    } catch {
      // الكود قد يكون GH-XXXXXX مباشرة
    }

    return decodedText.trim();
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

  const scanFrame = async () => {
    if (!scanning || !videoRef.current || !detectorRef.current) {
      return;
    }

    if (scanningLockRef.current) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (videoRef.current.readyState < 2) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    scanningLockRef.current = true;

    try {
      const codes = await detectorRef.current.detect(videoRef.current);

      if (codes && codes.length > 0) {
        const decodedText = codes[0].rawValue;

        if (decodedText) {
          const scannedToken = extractToken(decodedText);

          stopScanner();

          setToken(scannedToken);

          await checkCoupon(scannedToken);

          return;
        }
      }
    } catch {
      // تجاهل أخطاء الفريمات أثناء المسح
    }

    scanningLockRef.current = false;
    animationRef.current = requestAnimationFrame(scanFrame);
  };

  const startScanner = async () => {
    setCameraError('');

    if (!('BarcodeDetector' in window)) {
      setCameraError(
        'المتصفح لا يدعم مسح QR بالكاميرا. جرّب Chrome على الهاتف.'
      );
      return;
    }

    try {
      stopScanner();

      const detector = new window.BarcodeDetector({
        formats: ['qr_code'],
      });

      detectorRef.current = detector;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.muted = true;

      await videoRef.current.play();

      setScanning(true);

      animationRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      stopScanner();

      if (error?.name === 'NotAllowedError') {
        setCameraError(
          'تم رفض إذن الكاميرا. اسمح للمتصفح باستخدام الكاميرا ثم جرّب مرة أخرى.'
        );
      } else if (error?.name === 'NotFoundError') {
        setCameraError('لم يتم العثور على كاميرا في الجهاز.');
      } else {
        setCameraError(
          'تعذر تشغيل الكاميرا. تأكد من السماح للمتصفح باستخدامها.'
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

  const handleCheck = async (e) => {
    e.preventDefault();
    await checkCoupon(token);
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
          state: { coupon: res.data.coupon },
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

          {qrToken && (
            <p className="text-[#B8875A] text-sm">
              تم استقبال كود الكوبون من QR
            </p>
          )}

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
            disabled={checking}
            className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5 disabled:opacity-60"
          >
            {checking ? 'جاري التحقق...' : 'دخول'}
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

        <form onSubmit={handleCheck} className="flex flex-col gap-3">
          <input
            dir="ltr"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="GH-XXXXXX"
            className="w-full rounded-full bg-[#241610] ring-1 ring-white/5 text-[#F3E9DC] text-center tracking-widest py-3.5 placeholder:text-[#8A7862] focus:outline-none focus:ring-[#E8622D]"
          />

          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5 disabled:opacity-60"
          >
            {checking ? 'جاري التحقق...' : 'تحقق'}
          </button>
        </form>

        <button
          type="button"
          onClick={startScanner}
          disabled={scanning || checking}
          className="w-full rounded-full bg-[#2A1810] ring-1 ring-[#E8622D]/40 text-[#F3E9DC] font-semibold py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera className="w-5 h-5 text-[#E8622D]" />
          {scanning ? 'جاري مسح QR...' : 'مسح QR بالكاميرا'}
        </button>

        {cameraError && (
          <div className="rounded-2xl bg-[#2A1810] ring-1 ring-red-500/20 p-4 text-center">
            <p className="text-red-400 text-sm">
              {cameraError}
            </p>
          </div>
        )}

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
                  <div className="w-64 h-64 border-2 border-white rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
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
