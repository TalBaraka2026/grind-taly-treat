import React from 'react';
import { Image } from '@/components/ui/image';
import { Flame } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <div className="rounded-2xl bg-[#241610] ring-1 ring-white/5 overflow-hidden flex flex-col">

      {product.image ? (
        <div className="w-full bg-[#2A1810] flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name_en}
            className="w-full h-auto object-contain"
            fittingType="contain"
          />
        </div>
      ) : (
        <div className="h-20 w-full flex items-center justify-center bg-[#2A1810]">
          <p className="text-[#E8622D] font-bold text-sm tracking-wide text-center px-2">
            {product.name_en}
          </p>
        </div>
      )}

      <div className="p-3.5 flex flex-col gap-1 flex-1">

        <p className="text-[#F3E9DC] font-semibold text-[15px] leading-tight">
          {product.name_ar}
        </p>

        <p className="text-[#8A7862] text-xs">
          {product.name_en}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between">

          {typeof product.price === 'number' ? (
            <span className="text-[#E8622D] font-bold text-sm">
              {product.price} ر.س
            </span>
          ) : (
            <span />
          )}

          {typeof product.calories === 'number' && (
            <span className="flex items-center gap-1 text-[#8A7862] text-[11px]">
              <Flame className="w-3 h-3" />
              {product.calories} سعرة
            </span>
          )}

        </div>
      </div>

    </div>
  );
}
