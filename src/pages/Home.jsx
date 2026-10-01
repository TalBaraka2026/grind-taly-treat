import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PartnershipHeader from '@/components/coupon/PartnershipHeader';
import VenueSection from '@/components/coupon/VenueSection';
import BottomNav from '@/components/layout/BottomNav';

const PROMO_IMAGE =
  'https://raw.githubusercontent.com/TalBaraka2026/grind-taly-treat/main/file_00000000455c8208bfa2b63bf6c14e3b.png';

export default function Home() {
  const navigate = useNavigate();
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPromo(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showPromo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPromo(false)}
        >
          <img
            src={PROMO_IMAGE}
            alt="عرض خصم 15%"
            className="w-full max-w-md rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-700"
          />
        </div>
      )}

      <div className="min-h-screen bg-[#160D08] pb-24">
        <div className="max-w-md mx-auto px-5 pt-10 flex flex-col gap-8">
          <PartnershipHeader />

          <div className="text-center space-y-2">
            <p className="text-[#F3E9DC] text-2xl font-bold">
              عرض خاص لعملاء تال البركة
            </p>
            <p className="text-[#E8622D] text-3xl font-bold">
              خصم 15% لدى GRIND HOUSE
            </p>
            <p className="text-[#8A7862] text-sm">
              بالتعاون مع GRIND HOUSE
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/coupon')}
              className="w-full rounded-full bg-[#E8622D] text-white font-semibold py-4"
            >
              استخدم الخصم
            </button>

            <button
              onClick={() => navigate('/menu')}
              className="w-full rounded-full ring-1 ring-white/15 text-[#D8C7B3] font-medium py-4"
            >
              عرض المنيو
            </button>
          </div>

          <VenueSection />
        </div>

        <BottomNav />
      </div>
    </>
  );
}
