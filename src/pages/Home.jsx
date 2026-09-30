import React from 'react';
import { useNavigate } from 'react-router-dom';
import PartnershipHeader from '@/components/coupon/PartnershipHeader';
import VenueSection from '@/components/coupon/VenueSection';
import BottomNav from '@/components/layout/BottomNav';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#160D08] pb-24">
      <div className="max-w-md mx-auto px-5 pt-10 flex flex-col gap-8">
        <PartnershipHeader />

        <div className="text-center space-y-2">
          <p className="text-[#F3E9DC] text-2xl font-bold leading-snug">
            عرض خاص لعملاء تالي البركة
          </p>
          <p className="text-[#E8622D] text-3xl font-bold">خصم 15% لدى GRIND HOUSE</p>
          <p className="text-[#8A7862] text-sm mt-1">بالتعاون مع تالي البركة لألعاب الأطفال</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/coupon')}
            className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-4 active:scale-[0.98] transition-transform"
          >
            استخدم خصمي
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="w-full rounded-full ring-1 ring-white/15 text-[#D8C7B3] font-medium py-4 active:scale-[0.98] transition-transform"
          >
            عرض المنيو
          </button>
        </div>

        <VenueSection />
      </div>

      <BottomNav />
    </div>
  );
}