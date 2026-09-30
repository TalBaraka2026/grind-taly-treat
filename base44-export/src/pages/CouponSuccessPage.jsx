import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function CouponSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const coupon = location.state?.coupon;

  return (
    <div className="min-h-screen bg-[#160D08] flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full rounded-3xl bg-[#1E120C] ring-1 ring-white/10 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#E8622D]/15 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-[#E8622D]" />
        </div>
        <p className="text-[#F3E9DC] text-xl font-bold">تم تأكيد استخدام الخصم</p>
        <p className="text-[#E8622D] text-3xl font-bold">خصم 15%</p>
        {coupon?.token && (
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-2 mt-1">
            <p dir="ltr" className="text-[#F3E9DC] font-semibold tracking-wider">{coupon.token}</p>
          </div>
        )}
        <p className="text-[#8A7862] text-sm">تم تسجيل هذا الكوبون كمُستخدم بنجاح.</p>
        <button
          onClick={() => navigate('/cashier')}
          className="mt-2 w-full rounded-full bg-[#E8622D] text-white font-semibold py-3.5 active:scale-[0.98] transition-transform"
        >
          كوبون جديد
        </button>
      </div>
    </div>
  );
}