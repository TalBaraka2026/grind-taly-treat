import React, { useState } from 'react';
import PartnershipHeader from './PartnershipHeader';
import CountdownTimer from './CountdownTimer';
import { UtensilsCrossed } from 'lucide-react';

const CASHIER_URL =
  'https://talbaraka2026.github.io/grind-taly-treat/cashier?token=';

export default function CouponCard({ coupon, onExpire, onMenuClick }) {
  const [presenting, setPresenting] = useState(false);

  const cashierLink = `${CASHIER_URL}${encodeURIComponent(coupon.token)}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
    cashierLink
  )}`;

  if (presenting) {
    return (
      <div className="rounded-3xl bg-[#1E120C] ring-1 ring-white/10 p-6 flex flex-col items-center text-center gap-4">
        <p className="text-[#B8875A] text-sm">
          اعرض الـ QR للكاشير
        </p>

        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <img
            src={qrUrl}
            alt="QR Code للكوبون"
            className="w-56 h-56"
          />
        </div>

        <p className="text-[#D8C7B3] text-sm">
          أو استخدم الكود يدويًا
        </p>

        <div className="rounded-2xl bg-[#F5EDE1] px-6 py-4 w-full">
          <p
            dir="ltr"
            className="text-3xl font-bold text-[#2A1810] tracking-wider"
          >
            {coupon.token}
          </p>
        </div>

        <p className="text-[#E8622D] text-4xl font-bold">15%</p>

        <p className="text-[#D8C7B3] text-sm">
          خصم على طلبك لدى GRIND HOUSE
        </p>

        <button
          onClick={() => setPresenting(false)}
          className="mt-2 text-[#B8875A] text-sm underline"
        >
          رجوع
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#1E120C] ring-1 ring-white/10 shadow-2xl overflow-hidden">
      <div className="pt-7 pb-5 px-6 flex flex-col items-center gap-4">
        <PartnershipHeader />

        <div className="text-center space-y-1.5 mt-1">
          <p className="text-[#F3E9DC] text-lg font-semibold">
            عرض خاص لعملاء تال البركة
          </p>

          <p className="text-[#8A7862] text-xs">
            بالتعاون مع GRIND HOUSE
          </p>
        </div>
      </div>

      <div className="px-6">
        <div className="rounded-2xl bg-gradient-to-b from-[#E8622D] to-[#C94A1E] py-6 flex flex-col items-center">
          <p className="text-white/85 text-sm mb-1">خصم</p>

          <p className="text-white text-5xl font-bold leading-none">
            15%
          </p>

          <p className="text-white/90 text-sm mt-2">
            على طلبك لدى GRIND HOUSE
          </p>
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col items-center gap-2">
        <p className="text-[#8A7862] text-xs tracking-widest">
          الوقت المتبقي
        </p>

        <CountdownTimer
          expiresAt={coupon.expires_at}
          onExpire={onExpire}
          className="text-[#F3E9DC] text-4xl font-bold tabular-nums"
        />
      </div>

      <div className="px-6 pb-4 flex items-center justify-center">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-2">
          <p className="text-[#B8875A] text-[11px] mb-0.5 text-center">
            رقم الكوبون
          </p>

          <p
            dir="ltr"
            className="text-[#F3E9DC] font-semibold tracking-wider text-center"
          >
            {coupon.token}
          </p>
        </div>
      </div>

      <div className="px-6 pb-7 pt-1 flex flex-col gap-2.5">
        <button
          onClick={() => setPresenting(true)}
          className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5 active:scale-[0.98] transition-transform"
        >
          استخدم خصمي
        </button>

        <button
          onClick={onMenuClick}
          className="w-full rounded-full bg-transparent ring-1 ring-white/15 text-[#D8C7B3] font-medium py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <UtensilsCrossed className="w-4 h-4" />
          عرض المنيو
        </button>
      </div>
    </div>
  );
}
