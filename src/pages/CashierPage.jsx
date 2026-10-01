import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, XCircle, Clock, Ticket } from 'lucide-react';

const CASHIER_PIN = '1234';

export default function CashierPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const qrToken = searchParams.get('token') || '';

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [token, setToken] = useState(qrToken);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const checkCoupon = async (couponToken) => {
    if (!couponToken.trim()) return;

    setChecking(true);
    setResult(null);

    try {
      const res = await base44.functions.invoke('activateCoupon', {
        token: couponToken.trim(),
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

  const handlePinSubmit = async (e) => {
    e.preventDefault();

    if (pin !== CASHIER_PIN) {
      setPinError('رمز غير صحيح');
      return;
    }

    setUnlocked(true);
    setPinError('');

    // لو الدخول تم عن طريق QR، يتحقق من الكود تلقائيًا
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
