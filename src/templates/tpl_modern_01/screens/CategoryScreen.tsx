import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { MenuCategory, MenuItem } from '../../../core/types/menu.types';
import { useCart } from '../../../core/hooks/useCart';

export interface CategoryScreenProps {
  category: MenuCategory;
  onBack: () => void;
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  category,
  onBack,
  onSelectItem,
  onQuickAdd,
}) => {
  const { formatCurrency } = useCart();
  const [filter, setFilter] = useState<'All' | 'Veg' | 'Chicken' | 'Beef'>('All');

  // Filter items based on selected pill
  const filteredItems = useMemo(() => {
    if (filter === 'All') return category.items;
    if (filter === 'Veg') return category.items.filter((i) => i.diet_type === 'VEG' || i.diet_type === 'VEGAN');
    if (filter === 'Chicken') return category.items.filter((i) => i.name.toLowerCase().includes('chicken') || i.diet_type === 'NON_VEG');
    if (filter === 'Beef') return category.items.filter((i) => i.diet_type === 'NON_VEG' && !i.name.toLowerCase().includes('chicken'));
    return category.items;
  }, [category.items, filter]);

  return (
    <div className="min-h-screen bg-[#F7EFE3] text-[#1C1917] pb-28 font-sans px-5 pt-3 max-w-md mx-auto">
      {/* iOS Top Status Placeholder */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-[#1C1917] px-1 mb-2 opacity-90">
        <span>9:41</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px]">●●●</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* Top Back Arrow with 3D press */}
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-full bg-[#FAF4EC] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center text-[#1C1917] hover:scale-105 active:scale-95 transition mb-3"
        aria-label="Back to Home"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Category Header with Title & 3D Doodle Burger Box */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif font-black text-2xl tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            {category.name}
          </h1>
          <p className="text-xs text-[#7E756B] mt-0.5 max-w-[200px] leading-relaxed">
            {category.description || 'Fresh ingredients. Juicy bites. Only the best.'}
          </p>
        </div>

        {/* Vintage Line Doodle Illustration with 3D Depth */}
        <div className="w-16 h-16 rounded-2xl bg-[#EFE5D8] border border-[#E0D2C0] shadow-[0_6px_14px_rgba(142,130,118,0.25),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center p-2 text-2xl">
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">🍔</span>
        </div>
      </div>

      {/* 3D Filter Pills */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Veg', 'Chicken', 'Beef'] as const).map((opt) => {
          const isActive = filter === opt;
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all transform active:scale-95 ${
                isActive
                  ? 'bg-[#1C1917] text-[#F7EFE3] shadow-[0_4px_12px_rgba(28,25,23,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-black/30'
                  : 'bg-[#EFE5D8] text-[#1C1917] hover:bg-[#E5DACD] border border-[#E2D5C3] shadow-[0_2px_6px_rgba(142,130,118,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Vertical 3D Item Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_10px_22px_-4px_rgba(28,25,23,0.1),0_3px_8px_-2px_rgba(28,25,23,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.16)] transition-all"
          >
            {/* Left Image with shadow */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#EFE5D8] shadow-[0_3px_8px_rgba(0,0,0,0.08)]">
              <img
                src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Middle Details */}
            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-serif font-bold text-sm text-[#1C1917] leading-snug truncate">
                {item.name}
              </h3>
              <p className="text-[11px] text-[#7E756B] line-clamp-2 mt-0.5 leading-snug">
                {item.description}
              </p>
              <p className="font-serif font-bold text-xs text-[#1C1917] mt-1.5">
                {formatCurrency(item.base_price_paise)}
              </p>
            </div>

            {/* Right 3D Black Circular + Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(item);
              }}
              className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(28,25,23,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 active:shadow-[0_2px_4px_rgba(28,25,23,0.3)] transition"
              aria-label="Add item"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
