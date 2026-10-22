import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { MenuCategory, MenuItem, MenuSection } from '../../../core/types/menu.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface CategoryScreenProps {
  category: MenuCategory;
  sections?: MenuSection[];
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  categories?: MenuCategory[];
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string) => void;
  onBack: () => void;
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

const getCategoryIcon = (catName: string, catId: string): string => {
  const text = `${catName} ${catId}`.toLowerCase();
  if (text.includes('burger')) return '🍔';
  if (text.includes('fry') || text.includes('fries') || text.includes('appetizer') || text.includes('snack') || text.includes('starter')) return '🍟';
  if (text.includes('shake') || text.includes('smoothie')) return '🥤';
  if (text.includes('mocktail') || text.includes('cooler') || text.includes('cocktail') || text.includes('mojito')) return '🍹';
  if (text.includes('tea') || text.includes('chai') || text.includes('coffee') || text.includes('brew')) return '☕';
  if (text.includes('drink') || text.includes('beverage')) return '🥤';
  if (text.includes('pizza')) return '🍕';
  if (text.includes('dessert') || text.includes('cake') || text.includes('sweet') || text.includes('ice')) return '🍰';
  if (text.includes('sandwich') || text.includes('wrap') || text.includes('roll')) return '🥪';
  if (text.includes('biryani') || text.includes('rice') || text.includes('curry') || text.includes('bowl')) return '🍲';
  return '🍽️';
};

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  category,
  sections = [],
  selectedSectionId,
  onSelectSection,
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  onBack,
  onSelectItem,
  onQuickAdd,
}) => {
  const { formatCurrency } = useCart();
  const [filter, setFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const categoryIcon = getCategoryIcon(category.name, category.id);

  // Find parent section name if available
  const parentSection = useMemo(() => {
    return sections.find((s) => s.categories.some((c) => c.id === category.id));
  }, [sections, category.id]);

  // Filter items based on selected pill
  const filteredItems = useMemo(() => {
    if (filter === 'All') return category.items;
    if (filter === 'Veg') return category.items.filter((i) => i.diet_type === 'VEG' || i.diet_type === 'VEGAN');
    if (filter === 'Non-Veg') return category.items.filter((i) => i.diet_type === 'NON_VEG' || i.diet_type === 'EGG');
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
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-[#FAF4EC] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center text-[#1C1917] hover:scale-105 active:scale-95 transition"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {parentSection && (
          <span className="text-[11px] font-bold text-[#8E8276] uppercase tracking-wider bg-[#EFE5D8] px-3 py-1 rounded-full border border-[#E2D5C3]">
            {parentSection.name}
          </span>
        )}
      </div>

      {/* Multi-Section Selector Tabs (if multiple sections exist in MongoDB) */}
      {sections.length > 1 && onSelectSection && (
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar mb-3 py-1">
          <button
            onClick={() => onSelectSection('ALL')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedSectionId === 'ALL'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'bg-[#EFE5D8] text-[#7E756B] hover:text-[#1C1917]'
            }`}
          >
            All Menus
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSection(s.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedSectionId === s.id
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#EFE5D8] text-[#7E756B] hover:text-[#1C1917]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories Horizontal Pills (Switch between categories easily) */}
      {categories.length > 1 && onSelectCategory && (
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar mb-4 py-1">
          {categories.map((c) => {
            const isCurrent = (selectedCategoryId || category.id) === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all transform active:scale-95 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#1C1917] text-[#F7EFE3] shadow-[0_4px_12px_rgba(28,25,23,0.3)] border border-black/30'
                    : 'bg-[#FAF4EC] text-[#1C1917] hover:bg-[#EFE5D8] border border-[#E8DDCF]'
                }`}
              >
                <span>{getCategoryIcon(c.name, c.id)}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Header with Title & 3D Doodle Box */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif font-black text-2xl tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            {category.name}
          </h1>
          <p className="text-xs text-[#7E756B] mt-0.5 max-w-[200px] leading-relaxed">
            {category.description || 'Fresh ingredients. Crafted to perfection. Only the finest.'}
          </p>
        </div>

        {/* Category Avatar Box with 3D Depth */}
        <div className="w-16 h-16 rounded-2xl bg-[#EFE5D8] border border-[#E0D2C0] shadow-[0_6px_14px_rgba(142,130,118,0.25),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center p-2 text-2xl">
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{categoryIcon}</span>
        </div>
      </div>

      {/* 3D Filter Pills */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Veg', 'Non-Veg'] as const).map((opt) => {
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
        {filteredItems.length === 0 ? (
          <div className="bg-[#FAF4EC] rounded-2xl p-8 text-center border border-[#E8DDCF]">
            <p className="text-xs text-[#7E756B]">No items found under this category filter.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_10px_22px_-4px_rgba(28,25,23,0.1),0_3px_8px_-2px_rgba(28,25,23,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.16)] transition-all"
            >
              {/* Left Image with shadow and diet badge */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#EFE5D8] shadow-[0_3px_8px_rgba(0,0,0,0.08)] relative">
                <img
                  src={item.images?.[0]?.url || getFoodImageFallback(item.name, category.name)}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFoodImageFallback(item.name, category.name);
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs p-1 rounded-sm shadow-xs border border-black/10">
                  <div className={`w-2 h-2 rounded-full ${item.diet_type === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                </div>
              </div>

              {/* Middle Details */}
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="font-serif font-bold text-sm text-[#1C1917] leading-snug truncate">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#7E756B] line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-serif font-bold text-xs text-[#1C1917]">
                    {formatCurrency(item.base_price_paise)}
                  </span>
                  {item.addon_groups && item.addon_groups.length > 0 && (
                    <span className="text-[9px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-sm">
                      Customisable
                    </span>
                  )}
                </div>
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
          ))
        )}
      </div>
    </div>
  );
};
