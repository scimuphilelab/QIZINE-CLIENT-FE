import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, MenuItemAddon } from '../../../core/types/menu.types';
import type { SelectedAddon } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface CustomizeScreenProps {
  item: MenuItem;
  onBack: () => void;
  onConfirm: (
    item: MenuItem,
    variantId: string | undefined,
    selectedAddons: SelectedAddon[],
    quantity: number
  ) => void;
}

export const CustomizeScreen: React.FC<CustomizeScreenProps> = ({
  item,
  onBack,
  onConfirm,
}) => {
  const { formatCurrency } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  // Variants selection
  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const defaultVar = hasVariants
    ? item.variants!.find((v) => v.is_default) || item.variants![0]
    : undefined;
  const [selectedVariant, setSelectedVariant] = useState(defaultVar);

  // Extract addons dynamically from MongoDB item document structure
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

  const baseUnitPricePaise = selectedVariant
    ? selectedVariant.price_paise
    : item.base_price_paise;
  const addonTotalPaise = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const totalUnitPricePaise = baseUnitPricePaise + addonTotalPaise;
  const grandTotalPaise = totalUnitPricePaise * quantity;

  return (
    <div className="flex-1 bg-[#FAF4EE] text-stone-900 pb-24 font-sans px-4 sm:px-5 pt-4 flex flex-col justify-between selection:bg-[#FF385C]/20 selection:text-[#FF385C]">
      <div>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-stone-200/80 shadow-sm flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition mb-3"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Dish Image with Fixed Dimensions */}
        <div className="w-full h-44 max-h-44 rounded-3xl overflow-hidden mb-4 bg-white shadow-sm border border-stone-200/70 p-2 flex items-center justify-center relative shrink-0">
          <img
            src={item.images?.[0]?.url || getFoodImageFallback(item.name)}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
            }}
            className="w-full h-full max-w-full max-h-full object-cover rounded-2xl block shrink-0"
          />
        </div>

        {/* Title & Price */}
        <div className="flex items-start justify-between mb-1.5">
          <h1 className="font-extrabold text-lg sm:text-xl text-stone-900 leading-tight max-w-[240px]">
            {item.name}
          </h1>
          <span className="font-extrabold text-base sm:text-lg text-[#FF385C]">
            {formatCurrency(baseUnitPricePaise)}
          </span>
        </div>

        {Boolean(item.description) && (
          <p className="text-xs text-stone-500 mb-4 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Dynamic Portion / Variant Selection if present */}
        {hasVariants && (
          <div className="mb-4 pt-2 border-t border-stone-200/60">
            <h3 className="font-bold text-sm text-stone-900 mb-2">Select Portion / Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {item.variants!.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FF385C] bg-red-50/50 shadow-xs ring-1 ring-[#FF385C]'
                        : 'border-stone-200/80 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#FF385C]' : 'text-stone-800'}`}>
                      {v.name}
                    </span>
                    <span className="text-[11px] font-extrabold text-stone-600 mt-0.5">
                      {formatCurrency(v.price_paise)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Extras Section */}
        {availableAddons.length > 0 && (
          <div className="pt-3 border-t border-stone-200/60">
            <div className="flex items-baseline space-x-1 mb-2.5">
              <h3 className="font-bold text-sm text-stone-900">Custom Add-ons</h3>
              <span className="text-[11px] text-stone-400">(Optional)</span>
            </div>

            <div className="space-y-2">
              {availableAddons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#FF385C] bg-red-50/40 text-stone-900 shadow-xs'
                        : 'border-stone-200/70 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{addon.name}</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-stone-600">
                        +{formatCurrency(addon.price_paise)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#FF385C] text-white shadow-xs'
                            : 'border border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Quantity & Confirm Button */}
      <div className="pt-4 border-t border-stone-200/60 space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs sm:text-sm text-stone-800">Quantity</span>
          <div className="flex items-center space-x-3 bg-white rounded-full px-3 py-1.5 border border-stone-200/80 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5"
              aria-label="Decrease"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="font-bold text-xs text-stone-900 w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5"
              aria-label="Increase"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onConfirm(item, selectedVariant?.id, selectedAddons, quantity)}
          className="w-full py-4 px-6 bg-[#FF385C] hover:bg-[#E0294C] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-500/25 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <span>Confirm & Add to Basket</span>
          <span>•</span>
          <span>{formatCurrency(grandTotalPaise)}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomizeScreen;
