import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupon } from '@/lib/useCoupon';
import { Ticket } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

export default function CouponUsedPage() {
  const { coupon } = useCoupon();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#160D08] pb-24 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full rounded-3xl bg-[#1E120C] ring-1 ring-white/10 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Ticket className="w-8 h-8 text-[#B8875A]" />
        </div>
        <p className="text-[#F3E9DC] text-xl font-bold">تم استخدام هذا الكوبون مسبقًا</p>
        <p className="text-[#8A7862] text-sm">
          نتمنى لك تجربة رائعة لدى GRIND HOUSE.
        </p>
        {coupon?.token && (
          <p dir="ltr" className="text-[#8A7862] text-xs tracking-wider">{coupon.token}</p>
        )}
        <button
          onClick={() => navigate('/menu')}
          className="mt-2 w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5 active:scale-[0.98] transition-transform"
        >
          عرض المنيو
        </button>
      </div>
      <BottomNav />
    </div>
  );
}