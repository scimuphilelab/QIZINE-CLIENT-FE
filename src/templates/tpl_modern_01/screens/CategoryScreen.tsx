import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Heart } from 'lucide-react';
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

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  category,
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  onBack,
  onSelectItem,
  onQuickAdd,
}) => {
  const { formatCurrency } = useCart();
  const [filter, setFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Filter items based on selected pill
  const filteredItems = useMemo(() => {
    if (filter === 'All') return category.items;
    if (filter === 'Veg')
      return category.items.filter(
        (i) => i.diet_type === 'VEG' || i.diet_type === 'VEGAN'
      );
    if (filter === 'Non-Veg')
      return category.items.filter(
        (i) => i.diet_type === 'NON_VEG' || i.diet_type === 'EGG'
      );
    return category.items;
  }, [category.items, filter]);

  return (
    <div className="flex-1 bg-[#FAF4EE] text-stone-900 pb-28 font-sans px-4 sm:px-6 pt-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white border border-stone-200/80 shadow-sm flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="font-black text-lg sm:text-xl text-stone-900 truncate max-w-[220px]">
          {category.name}
        </h1>

        <div className="w-11 h-11" />
      </div>

      {/* Horizontal Subcategory / Category Switcher Pills */}
      {categories.length > 1 && onSelectCategory && (
        <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar mb-5 py-1">
          {categories.map((c) => {
            const isSelected = (selectedCategoryId || category.id) === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#FF385C] text-white shadow-md shadow-red-500/25'
                    : 'bg-white text-stone-700 border border-stone-200/60 hover:bg-stone-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Diet Filters (All, Veg, Non-Veg) */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          {(['All', 'Veg', 'Non-Veg'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filter === tab
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200/60 hover:text-stone-900'
              }`}
            >
              {tab === 'Veg' && '🥦 '}
              {tab === 'Non-Veg' && '🍗 '}
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs sm:text-sm text-stone-400 font-semibold">
          {filteredItems.length} items
        </span>
      </div>

      {/* Food Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 shadow-sm mt-4">
          <p className="text-base font-extrabold text-stone-800">No items available</p>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Try switching dietary filters or browse other categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5">
          {filteredItems.map((item) => {
            const isFav = !!favorites[item.id];
            const imageUrl =
              item.images?.[0]?.url || getFoodImageFallback(item.name);
            const subLabel =
              item.short_name ||
              item.tags?.[0] ||
              (item.diet_type === 'VEG' ? 'Vegetarian' : 'Chef Special');

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.98]"
              >
                {/* Top Row: Rating Badge & Heart Favorite */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-stone-800 bg-stone-50 px-2 py-0.5 rounded-full">
                    <span className="text-amber-500">★</span>
                    <span>4.9</span>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-1 rounded-full text-stone-400 hover:text-[#FF385C] transition-colors"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${
                        isFav
                          ? 'fill-[#FF385C] text-[#FF385C]'
                          : 'text-stone-300 stroke-[2]'
                      }`}
                    />
                  </button>
                </div>

                {/* Food Image with Fixed Sizing & Rounded Border Radius */}
                <div className="w-full h-28 sm:h-32 max-h-32 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center my-1.5 p-1 shadow-2xs relative shrink-0">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        getFoodImageFallback(item.name);
                    }}
                    className="w-full h-full max-w-full max-h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-sm block shrink-0"
                  />
                </div>

                {/* Details */}
                <div className="mt-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-stone-900 leading-snug truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-400 font-medium truncate mt-0.5">
                    {subLabel}
                  </p>
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-100">
                  <span className="font-black text-sm sm:text-base text-stone-900">
                    {formatCurrency(item.base_price_paise)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(item);
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FF385C] hover:bg-[#E0294C] text-white flex items-center justify-center shadow-md shadow-red-500/25 hover:scale-110 active:scale-95 transition-all"
                    aria-label="Add item"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryScreen;
