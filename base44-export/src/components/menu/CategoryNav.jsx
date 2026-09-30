import React from 'react';

export default function CategoryNav({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1" dir="rtl">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            active === cat.key
              ? 'bg-[#E8622D] text-white'
              : 'bg-[#241610] text-[#B8875A] ring-1 ring-white/5'
          }`}
        >
          {cat.labelAr}
        </button>
      ))}
    </div>
  );
}