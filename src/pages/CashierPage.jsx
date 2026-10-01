import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

export default function CashierPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setStarting(true);

    try {
      if (!window.isSecureContext) {
        throw new Error(
          'الصفحة ليست HTTPS آمنة'
        );
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'المتصفح لا يدعم تشغيل الكاميرا'
        );
      }

      // طلب الكاميرا أولاً
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      // إظهار نافذة الكاميرا أولاً
      setCameraOpen(true);

      // انتظار ظهور عنصر الفيديو
      setTimeout(async () => {
        try {
          if (!videoRef.current) {
            throw new Error(
              'لم يظهر عنصر الفيديو'
            );
          }

          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute(
            'playsinline',
            'true'
          );
          videoRef.current.muted = true;

          await videoRef.current.play();

          setStarting(false);
        } catch (err) {
          setStarting(false);

          if (streamRef.current) {
            streamRef.current
              .getTracks()
              .forEach((track) => track.stop());

            streamRef.current = null;
          }

          setCameraOpen(false);

          setError(
            `اسم الخطأ: ${err?.name || 'Error'}\n\n` +
            `التفاصيل: ${
              err?.message || 'خطأ غير معروف'
            }`
          );
        }
      }, 300);

    } catch (err) {
      setStarting(false);

      setError(
        `اسم الخطأ: ${err?.name || 'Error'}\n\n` +
        `التفاصيل: ${
          err?.message || 'خطأ غير معروف'
        }`
      );
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#160D08] px-6 py-10 flex flex-col items-center"
    >
      <div className="max-w-sm w-full flex flex-col gap-5">

        <h1 className="text-[#F3E9DC] text-2xl font-bold text-center">
          اختبار كاميرا الكاشير
        </h1>

        <button
          onClick={startCamera}
          disabled={starting}
          className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Camera className="w-5 h-5" />

          {starting
            ? 'جاري تشغيل الكاميرا...'
            : 'تشغيل الكاميرا'}
        </button>

        {error && (
          <div className="rounded-2xl bg-[#2A1810] ring-1 ring-red-500/30 p-5">
            <p className="text-red-400 text-sm whitespace-pre-line text-center">
              {error}
            </p>
          </div>
        )}

        {cameraOpen && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-5">

            <div className="w-full max-w-md flex flex-col gap-4">

              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-lg">
                  كاميرا الكاشير
                </p>

                <button
                  onClick={stopCamera}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl ring-2 ring-[#E8622D] bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>

              <p className="text-white text-center">
                الكاميرا تعمل بنجاح
              </p>

            </div>
          </div>
        )}

      </div>
    </div>
  );
              }
