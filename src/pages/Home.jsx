import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnershipHeader from '@/components/coupon/PartnershipHeader';
import VenueSection from '@/components/coupon/VenueSection';
import BottomNav from '@/components/layout/BottomNav';

const PROMO_IMAGE =
  'https://raw.githubusercontent.com/TalBaraka2026/grind-taly-treat/main/file_00000000ac308208a5771647ae823410.png';

export default function Home() {
  const navigate = useNavigate();
  const [showPromo, setShowPromo] = useState(true);

  return (
    <div className="min-h-screen bg-[#160D08] pb-24">

      {/* الواجهة الافتتاحية */}
      {showPromo && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4">

          <div className="relative w-full max-w-md">

            {/* زر الإغلاق */}
            <button
              onClick={() => setShowPromo(false)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-[#241610] text-white text-2xl flex items-center justify-center ring-1 ring-white/20 shadow-lg"
              aria-label="إغلاق"
            >
              ×
            </button>

            {/* الصورة */}
            <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-[#241610]">
              <img
                src={PROMO_IMAGE}
                alt="عرض خصم 15% من GRIND HOUSE لعملاء تالي البركة"
                className="block w-full h-auto"
              />
            </div>

            {/* زر الدخول */}
            <button
              onClick={() => setShowPromo(false)}
              className="w-full mt-4 rounded-full bg-[#E8622D] text-white font-bold py-4 text-lg shadow-lg active:scale-[0.98] transition-transform"
            >
              دخول للموقع
            </button>

          </div>
        </div>
      )}

      {/* الصفحة الرئيسية */}
      <div className="max-w-md mx-auto px-5 pt-10 flex flex-col gap-8">
        <PartnershipHeader />

        <div className="text-center space-y-2">
          <p className="text-[#F3E9DC] text-2xl font-bold leading-snug">
            عرض خاص لعملاء تالي البركة
          </p>

          <p className="text-[#E8622D] text-3xl font-bold">
            خصم 15% لدى GRIND HOUSE
          </p>

          <p className="text-[#8A7862] text-sm mt-1">
            بالتعاون مع تالي البركة لألعاب الأطفال
          </p>
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
