import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Ticket } from 'lucide-react';

const items = [
  { label: 'الرئيسية', path: '/', icon: Home },
  { label: 'المنيو', path: '/menu', icon: UtensilsCrossed },
  { label: 'خصمي', path: '/coupon', icon: Ticket },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#1E120C]/97 backdrop-blur border-t border-white/10">
      <div className="max-w-md mx-auto flex items-stretch">
        {items.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={1.75}
                color={active ? '#E8622D' : '#A8967F'}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: active ? '#E8622D' : '#A8967F' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}