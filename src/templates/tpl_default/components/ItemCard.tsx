import React from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import type { MenuItem } from '../../../core/types/menu.types';
import { useCart } from '../../../core/hooks/useCart';

export interface ItemCardProps {
  item: MenuItem;
  onOpenCustomise: (item: MenuItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onOpenCustomise }) => {
  const { addItem, updateQuantity, items, formatCurrency } = useCart();

  const isCustomisable =
    (item.variants && item.variants.length > 1) ||
    (item.addon_groups && item.addon_groups.length > 0);

  // Total quantity of this specific item in cart
  const cartEntries = items.filter((i) => i.item_id === item.id);
  const totalCount = cartEntries.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddClick = () => {
    // If device supports vibration, give light haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore
      }
    }

    if (isCustomisable) {
      onOpenCustomise(item);
    } else {
      const defaultVarId =
        item.variants && item.variants.length > 0 ? item.variants[0].id : undefined;
      addItem(item, defaultVarId);
    }
  };

  const handleDecrement = () => {
    if (cartEntries.length > 0) {
      const target = cartEntries[cartEntries.length - 1];
      updateQuantity(target.cart_item_id, target.quantity - 1);
    }
  };

  const isVeg = item.diet_type === 'VEG' || item.diet_type === 'VEGAN';

  return (
    <article className="bg-surface rounded-2xl p-3.5 border border-black/5 shadow-xs flex items-start justify-between gap-3 transition-all hover:shadow-soft">
      {/* Left Item Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center space-x-1.5 mb-1">
          {/* Veg / Non-Veg Indicator */}
          <span
            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
              isVeg ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isVeg ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </span>

          {item.tags && item.tags.length > 0 && (
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {item.tags[0]}
            </span>
          )}
        </div>

        <h3 className="font-heading font-semibold text-sm text-gray-900 leading-snug">
          {item.name}
        </h3>

        <div className="flex items-baseline space-x-1.5 mt-1">
          <p className="text-xs font-bold text-gray-900">
            {formatCurrency(item.base_price_paise)}
          </p>
          {isCustomisable && (
            <span className="text-[10px] font-medium text-muted">onwards</span>
          )}
        </div>

        {isCustomisable && (
          <span className="inline-block text-[10px] font-semibold text-primary/90 mt-0.5">
            Customisable
          </span>
        )}

        {item.description && (
          <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Right Image & Swiggy-Style ADD+ Action */}
      <div className="relative flex flex-col items-center shrink-0 w-24">
        {item.images && item.images.length > 0 ? (
          <div className="w-24 h-24 min-w-[6rem] min-h-[6rem] max-w-[6rem] max-h-[6rem] rounded-2xl overflow-hidden bg-gray-100 shadow-xs mb-2 shrink-0">
            <img
              src={item.images[0].url}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full max-w-full max-h-full object-cover block shrink-0"
            />
          </div>
        ) : (
          <div className="w-24 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-gray-300" />
          </div>
        )}

        {/* Stepper or ADD Button */}
        {totalCount > 0 ? (
          <div className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-xl px-2 py-1.5 shadow-soft">
            <button
              onClick={handleDecrement}
              className="p-1 hover:bg-black/10 rounded transition text-xs font-bold"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-center">{totalCount}</span>
            <button
              onClick={handleAddClick}
              className="p-1 hover:bg-black/10 rounded transition text-xs font-bold"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="w-full py-1.5 bg-surface border border-primary/30 text-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center space-x-1"
          >
            <span>ADD</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
