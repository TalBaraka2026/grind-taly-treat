import React from 'react';
import { Image } from '@/components/ui/image';

const TALY_LOGO = 'https://media.base44.com/images/public/user_6abd3b553efd1e9df5c03419/465e90c84_file_00000000b9e88211a5be3d9760e16833.png';
const GRINDHOUSE_LOGO = 'https://media.base44.com/images/public/user_6abd3b553efd1e9df5c03419/cab178d2b_file_0000000019d08211901431d836c80c70.png';

export default function PartnershipHeader({ compact = false }) {
  const size = compact ? 'w-14 h-14' : 'w-20 h-20 sm:w-24 sm:h-24';
  return (
    <div className="flex flex-col items-center gap-3">
      {!compact && (
        <p className="text-[13px] tracking-widest text-[#B8875A] font-medium">بالتعاون بين</p>
      )}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <div className={`${size} rounded-full bg-white shadow-sm ring-1 ring-black/5 overflow-hidden flex items-center justify-center`}>
          <Image src={TALY_LOGO} alt="تالي البركة لألعاب الأطفال" className="w-full h-full" fittingType="fit" />
        </div>
        <span className="text-[#B8875A] text-lg font-light">×</span>
        <div className={`${size} rounded-full bg-white shadow-sm ring-1 ring-black/5 overflow-hidden flex items-center justify-center`}>
          <Image src={GRINDHOUSE_LOGO} alt="GRIND HOUSE COFFEE & COOKIES" className="w-full h-full" fittingType="fit" />
        </div>
      </div>
    </div>
  );
}