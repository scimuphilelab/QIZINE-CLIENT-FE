import React, { useState } from 'react';
import { ArrowLeft, Heart, Plus, Minus, Check } from 'lucide-react';
import type { MenuItem, MenuItemAddon } from '../../../core/types/menu.types';
import type { SelectedAddon } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface ItemDetailScreenProps {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (item: MenuItem, selectedAddons: SelectedAddon[], quantity: number) => void;
}

export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  item,
  onBack,
  onAddToCart,
}) => {
  const { formatCurrency } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  // Extract addons from MongoDB item document structure (supporting options or addons array)
  const firstAddonGroup = item.addon_groups?.[0];
  const availableAddons: MenuItemAddon[] =
    firstAddonGroup?.options || firstAddonGroup?.addons || [];

  const handleToggleAddon = (addon: MenuItemAddon) => {
    const exists = selectedAddons.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons((prev) => [
        ...prev,
        {
          id: addon.id,
          name: addon.name,
          price_paise: addon.price_paise,
          group_id: firstAddonGroup?.id || 'grp_extras',
        },
      ]);
    }
  };

  const addonTotalPaise = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const totalUnitPricePaise = item.base_price_paise + addonTotalPaise;
  const grandTotalPaise = totalUnitPricePaise * quantity;

  const handleAdd = () => {
    onAddToCart(item, selectedAddons, quantity);
  };

  return (
    <div className="min-h-screen bg-[#1C1917] text-[#1C1917] font-sans max-w-md mx-auto flex flex-col justify-between">
      {/* Top Hero Image Area */}
      <div className="relative h-72 w-full bg-[#1C1917] overflow-hidden">
        <img
          src={item.images?.[0]?.url || getFoodImageFallback(item.name)}
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
          }}
          className="w-full h-full object-cover brightness-95"
        />

        {/* Top Controls Overlay with 3D button depth */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition"
            aria-label="Favorite"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Bottom Sheet Card Container with 3D Upper Glow & Shadow */}
      <div className="bg-[#F7EFE3] rounded-t-3xl p-6 flex-1 -mt-4 relative z-20 flex flex-col justify-between shadow-[0_-15px_45px_rgba(0,0,0,0.35),0_-1px_3px_rgba(255,255,255,0.7)] border-t border-[#FAF4EC]">
        <div className="space-y-4">
          {/* Title and Price Row */}
          <div className="flex items-start justify-between">
            <h1 className="font-serif font-black text-xl text-[#1C1917] leading-tight max-w-[240px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {item.name}
            </h1>
            <span className="font-serif font-black text-lg text-[#1C1917]">
              {formatCurrency(item.base_price_paise)}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[#7E756B] leading-relaxed">
            {item.description || 'Juicy patty, fresh lettuce, tomato, onion, special sauce.'}
          </p>

          {/* Customize Section */}
          <div className="pt-2 border-t border-[#E8DDCF]">
            <div className="flex items-baseline space-x-1 mb-2.5">
              <h3 className="font-serif font-bold text-sm text-[#1C1917]">Customize</h3>
              <span className="text-[11px] text-[#7E756B]">(Optional)</span>
            </div>

            <div className="space-y-2.5">
              {availableAddons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon)}
                    className="flex items-center justify-between text-xs cursor-pointer select-none py-1.5 px-2 rounded-xl hover:bg-[#EFE5D8]/50 transition"
                  >
                    <span className="text-[#1C1917] font-medium">{addon.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-[#7E756B]">+{formatCurrency(addon.price_paise)}</span>
                      {/* 3D Checkbox */}
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-[0_2px_5px_rgba(28,25,23,0.35)]'
                            : 'border-[#1C1917]/40 bg-[#FAF4EC] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quantity & Add to Cart Footer */}
        <div className="pt-5 border-t border-[#E8DDCF] space-y-4">
          {/* Quantity Stepper Row */}
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#1C1917]">Quantity</span>
            <div className="flex items-center space-x-3 bg-[#EFE5D8] rounded-xl px-3 py-1.5 border border-[#E2D5C3] shadow-[inset_0_2px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(255,255,255,0.8)]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="font-bold text-xs text-[#1C1917] w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Black Full-Width 3D CTA Button */}
          <button
            onClick={handleAdd}
            className="w-full py-4 px-5 bg-[#1C1917] text-[#F7EFE3] font-bold text-xs rounded-2xl shadow-[0_10px_24px_-4px_rgba(28,25,23,0.4),0_4px_8px_-2px_rgba(28,25,23,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.5)] active:scale-98 transition flex items-center justify-center space-x-2"
          >
            <span>Add to Cart • {formatCurrency(grandTotalPaise)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
