import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupon } from '@/lib/useCoupon';
import CouponCard from '@/components/coupon/CouponCard';
import BottomNav from '@/components/layout/BottomNav';

export default function CouponPage() {
  const { coupon, loading, refresh } = useCoupon();
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!coupon || handledRef.current) return;
    if (coupon.status === 'used') {
      handledRef.current = true;
      navigate('/coupon-used', { replace: true });
    } else if (coupon.status === 'expired') {
      handledRef.current = true;
      navigate('/coupon-expired', { replace: true });
    }
  }, [coupon, navigate]);

  useEffect(() => {
    if (!coupon || coupon.status !== 'active') return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [coupon, refresh]);

  if (loading || !coupon) {
    return (
      <div className="min-h-screen bg-[#160D08] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#E8622D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#160D08] pb-24">
      <div className="max-w-md mx-auto px-5 pt-10">
        <CouponCard
          coupon={coupon}
          onExpire={() => navigate('/coupon-expired', { replace: true })}
          onMenuClick={() => navigate('/menu')}
        />
      </div>
      <BottomNav />
    </div>
  );
}