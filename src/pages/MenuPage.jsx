import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCoupon } from '@/lib/useCoupon';
import CategoryNav from '@/components/menu/CategoryNav';
import ProductCard from '@/components/menu/ProductCard';
import StickyCouponBar from '@/components/menu/StickyCouponBar';
import BottomNav from '@/components/layout/BottomNav';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { key: 'hot_drinks', labelAr: 'المشروبات الساخنة', labelEn: 'HOT DRINKS' },
  { key: 'iced_drinks', labelAr: 'المشروبات الباردة', labelEn: 'ICED DRINKS' },
  { key: 'summer_drinks', labelAr: 'المشروبات الصيفية', labelEn: 'SUMMER DRINKS' },
  { key: 'desserts', labelAr: 'الحلى', labelEn: 'DESSERTS' },
  { key: 'addons', labelAr: 'الإضافات', labelEn: 'ADD-ONS' },
];

export default function MenuPage() {
  const { coupon } = useCoupon();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('hot_drinks');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Product.list('sort_order').then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return products.filter(
        (p) => p.name_ar.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q)
      );
    }
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory, search]);

  const hasCouponBar = coupon && coupon.status === 'active';

  return (
    <div className="min-h-screen bg-[#160D08]" style={{ paddingBottom: hasCouponBar ? 152 : 88 }}>
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-8 pb-4 text-center">
          <p className="text-[#F3E9DC] text-2xl font-bold">GRIND HOUSE</p>
          <p className="text-[#B8875A] text-xs tracking-widest">COFFEE &amp; COOKIES</p>
        </div>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7862]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full rounded-full bg-[#241610] ring-1 ring-white/5 text-[#F3E9DC] text-sm pr-10 pl-4 py-3 placeholder:text-[#8A7862] focus:outline-none focus:ring-[#E8622D]"
            />
          </div>
        </div>

        {!search.trim() && (
          <CategoryNav categories={CATEGORIES} active={activeCategory} onSelect={setActiveCategory} />
        )}

        <div className="px-5 pt-4">
          {!search.trim() && (
            <p className="text-[#8A7862] text-xs tracking-widest mb-3">
              {CATEGORIES.find((c) => c.key === activeCategory)?.labelEn}
            </p>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-4 border-white/10 border-t-[#E8622D] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[#8A7862] text-sm text-center py-10">لا توجد نتائج</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <StickyCouponBar coupon={coupon} bottomOffset={64} />
      <BottomNav />
    </div>
  );
}