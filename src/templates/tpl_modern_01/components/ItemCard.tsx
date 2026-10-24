import React from 'react';
import type { MenuItem } from '../../../core/types/menu.types';
import { useCart } from '../../../core/hooks/useCart';

export interface ItemCardProps {
  item: MenuItem;
  onOpenCustomise: (item: MenuItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onOpenCustomise }) => {
  const { addItem, updateQuantity, items, formatCurrency } = useCart();
  const cartEntries = items.filter((i) => i.item_id === item.id);
  const totalCount = cartEntries.reduce((sum, i) => sum + i.quantity, 0);

  const isCustomisable =
    (item.variants && item.variants.length > 1) ||
    (item.addon_groups && item.addon_groups.length > 0);

  const handleAdd = () => {
    if (isCustomisable) {
      onOpenCustomise(item);
    } else {
      const defaultVarId =
        item.variants && item.variants.length > 0 ? item.variants[0].id : undefined;
      addItem(item, defaultVarId);
    }
  };

  const isVeg = item.diet_type === 'VEG' || item.diet_type === 'VEGAN';

  return (
    <article className="bg-white rounded-2xl p-4 border border-[#C8A15B]/30 shadow-xs mb-3 transition hover:shadow-soft">
      {item.images && item.images.length > 0 && (
        <div className="relative h-44 max-h-44 w-full mb-3 rounded-xl overflow-hidden shrink-0">
          <img
            src={item.images[0].url}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full max-w-full max-h-full object-cover block shrink-0"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-[#C8A15B] text-xs font-serif px-2.5 py-0.5 rounded-md font-semibold">
            {formatCurrency(item.base_price_paise)}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-1.5 mb-1">
            <span
              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                isVeg ? 'border-green-700' : 'border-red-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isVeg ? 'bg-green-700' : 'bg-red-700'
                }`}
              />
            </span>
            <h3 className="font-heading text-base font-bold text-gray-900 tracking-wide">
              {item.name}
            </h3>
          </div>
          {item.description && (
            <p className="text-xs text-gray-600 font-serif leading-relaxed italic">
              {item.description}
            </p>
          )}
          {isCustomisable && (
            <span className="inline-block text-[10px] text-[#C8A15B] font-bold uppercase tracking-wider mt-1">
              Custom Curation
            </span>
          )}
        </div>

        {!item.images?.length && (
          <span className="font-serif font-bold text-sm text-[#1F3D2B]">
            {formatCurrency(item.base_price_paise)}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex justify-end">
        {totalCount > 0 ? (
          <div className="flex items-center space-x-3 bg-[#1F3D2B] text-white px-3.5 py-1.5 rounded-lg text-xs font-serif shadow-xs">
            <button
              onClick={() => {
                const target = cartEntries[cartEntries.length - 1];
                updateQuantity(target.cart_item_id, target.quantity - 1);
              }}
              className="hover:opacity-75"
            >
              -
            </button>
            <span className="font-bold">{totalCount}</span>
            <button onClick={handleAdd} className="hover:opacity-75">
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="px-4 py-1.5 text-xs font-serif font-semibold border border-[#1F3D2B] text-[#1F3D2B] rounded-lg hover:bg-[#1F3D2B] hover:text-white transition shadow-2xs"
          >
            Add to Order
          </button>
        )}
      </div>
    </article>
  );
};
