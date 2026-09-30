import React from 'react';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '@/components/coupon/CountdownTimer';

export default function StickyCouponBar({ coupon, bottomOffset = 64 }) {
  const navigate = useNavigate();
  if (!coupon || coupon.status !== 'active') return null;

  return (
    <div
      className="fixed inset-x-0 z-30 px-4"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div className="max-w-md mx-auto rounded-2xl bg-[#E8622D] shadow-lg px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-white text-sm font-semibold">🎁 خصمك 15%</p>
          <p className="text-white/85 text-xs mt-0.5">
            متبقي <CountdownTimer expiresAt={coupon.expires_at} className="inline" />
          </p>
        </div>
        <button
          onClick={() => navigate('/coupon')}
          className="rounded-full bg-white text-[#C94A1E] text-sm font-semibold px-4 py-2 active:scale-95 transition-transform shrink-0"
        >
          عرض الخصم
        </button>
      </div>
    </div>
  );
}