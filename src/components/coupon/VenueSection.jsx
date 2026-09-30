import React from 'react';
import { MapPin } from 'lucide-react';

const VENUE_PHOTO =
  'https://media.base44.com/images/public/user_6abd3b553efd1e9df5c03419/338406040_IMG-20260927-WA0032.jpg';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=GRIND+HOUSE+Promenade+Jeddah+Corniche';

export default function VenueSection() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#241610] ring-1 ring-white/5">

      {/* صورة المحل كاملة بدون قص */}
      <div className="w-full bg-[#241610]">
        <img
          src={VENUE_PHOTO}
          alt="GRIND HOUSE - Promenade Jeddah Corniche"
          className="block w-full h-auto"
        />
      </div>

      {/* معلومات المحل */}
      <div className="p-5 flex flex-col items-center text-center gap-1.5">

        <p className="text-[#F3E9DC] font-semibold text-lg leading-tight">
          GRIND HOUSE
        </p>

        <p className="text-[#B8875A] text-xs tracking-wide">
          COFFEE &amp; COOKIES
        </p>

        <p className="text-[#D8C7B3] text-sm mt-2">
          كورنيش جدة – البروميناد
        </p>

        <p className="text-[#8A7862] text-xs">
          Promenade – Jeddah Corniche
        </p>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium bg-[#E8622D] text-white active:scale-95 transition-transform"
        >
          <MapPin className="w-4 h-4" />
          الموقع على الخريطة
        </a>

      </div>
    </div>
  );
}
