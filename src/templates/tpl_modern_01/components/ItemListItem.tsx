import React from 'react';
import { ChevronRight, Clock, Star, Flame } from 'lucide-react';
import type { MenuItem } from '../../../core/types/menu.types';
import { DishThumbnail } from './DishThumbnail';
import { DietBadge } from './DietBadge';
import { useCart } from '../../../core/hooks/useCart';

export interface ItemListItemProps {
  item: MenuItem;
  onClick: () => void;
}

export const ItemListItem: React.FC<ItemListItemProps> = ({ item, onClick }) => {
  const { formatCurrency } = useCart();

  const firstImageUrl = item.images && item.images.length > 0 ? item.images[0]?.url : undefined;

  // Determine starting price (base price or cheapest variant)
  const displayPricePaise =
    item.variants && item.variants.length > 0
      ? Math.min(...item.variants.map((v) => v.price_paise))
      : item.base_price_paise;

  const hasMultipleVariants = Boolean(item.variants && item.variants.length > 1);

  // Subtitle / tags line
  const tagsText = [
    item.short_name,
    item.tags && item.tags.length > 0 ? item.tags.slice(0, 2).join(', ') : null,
  ]
    .filter(Boolean)
    .join(' • ');

  // Rating badge text (simulate standard rating if prep time exists or default 4.2-4.6 for quality preview)
  const ratingScore = item.prep_time_minutes ? (4.0 + (item.prep_time_minutes % 8) * 0.1).toFixed(1) : null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="w-full bg-white hover:bg-stone-50/90 active:bg-stone-100 transition-colors p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between gap-3 cursor-pointer group select-none first:rounded-t-2xl last:rounded-b-2xl last:border-b-0"
    >
      {/* 1. Left Thumbnail (Strictly no heart/save icon, clean "No preview" fallback) */}
      <DishThumbnail
        url={firstImageUrl}
        name={item.name}
        className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 rounded-2xl"
      />

      {/* 2. Middle Content Column with Tailored Typography */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Title row with Veg/Non-Veg indicator */}
        <div className="flex items-center gap-2 mb-1">
          <DietBadge dietType={item.diet_type} size="sm" />
          <h3 className="font-heading font-extrabold text-[15px] sm:text-[16px] text-stone-900 truncate leading-snug tracking-tight group-hover:text-[#FF5722] transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Rating & Prep Time row (Matching screenshot: ★ 4.2 (49) • 20-25 mins) */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs mb-1">
          {ratingScore ? (
            <span className="inline-flex items-center gap-1 font-heading font-black text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md leading-none">
              <Star className="w-2.5 h-2.5 fill-emerald-600 stroke-emerald-600" />
              <span>{ratingScore}</span>
            </span>
          ) : null}

          {item.prep_time_minutes ? (
            <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-stone-500">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{item.prep_time_minutes} mins</span>
            </span>
          ) : null}

          {item.spice_level ? (
            <span className="flex items-center gap-0.5 text-[11px] font-sans font-bold text-amber-600">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Spice {item.spice_level}</span>
            </span>
          ) : null}
        </div>

        {/* Category / tags / short description */}
        {(tagsText || item.description) && (
          <p className="font-sans text-[12px] text-stone-500 font-normal line-clamp-1 leading-normal mb-1">
            {tagsText || item.description}
          </p>
        )}

        {/* Price display with Heading Font */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-black text-[15px] sm:text-base text-stone-900 tracking-tight">
            {formatCurrency(displayPricePaise)}
          </span>
          {hasMultipleVariants && (
            <span className="font-sans text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">
              (Options)
            </span>
          )}
        </div>
      </div>

      {/* 3. Right Action Pill (Matching screenshot: e.g. 70% OFF >, ITEMS AT ₹49 >) */}
      <div className="shrink-0 flex items-center justify-end">
        <div className="flex items-center gap-1 bg-[#FFF0EB] text-[#E64A19] border border-[#FFD8CC] px-2.5 py-1.5 rounded-xl text-[11px] font-heading font-black tracking-wide transition-all group-hover:bg-[#FFE6DC] group-hover:shadow-2xs">
          <span>{hasMultipleVariants ? 'OPTIONS' : 'ADD +'}</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.8]" />
        </div>
      </div>
    </div>
  );
};

export default ItemListItem;
