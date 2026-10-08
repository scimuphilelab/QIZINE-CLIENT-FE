import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, MenuItemAddon } from '../../../core/types/menu.types';
import type { SelectedAddon } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';

export interface CustomizeScreenProps {
  item: MenuItem;
  onBack: () => void;
  onConfirm: (item: MenuItem, selectedAddons: SelectedAddon[], quantity: number) => void;
}

export const CustomizeScreen: React.FC<CustomizeScreenProps> = ({
  item,
  onBack,
  onConfirm,
}) => {
  const { formatCurrency } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

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

  const addonTotalPaise = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const totalUnitPricePaise = item.base_price_paise + addonTotalPaise;
  const grandTotalPaise = totalUnitPricePaise * quantity;

  return (
    <div className="min-h-screen bg-[#F7EFE3] text-[#1C1917] pb-24 font-sans px-5 pt-3 max-w-md mx-auto flex flex-col justify-between">
      <div>
        {/* iOS Top Status Placeholder */}
        <div className="flex justify-between items-center text-[11px] font-semibold text-[#1C1917] px-1 mb-2 opacity-90">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* 3D Back Button */}
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-[#FAF4EC] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center text-[#1C1917] hover:scale-105 active:scale-95 transition mb-3"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 3D Elevated Top Dish Image */}
        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#1C1917] shadow-[0_12px_28px_-6px_rgba(28,25,23,0.25)] border border-[#E8DDCF]">
          <img
            src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Price */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-serif font-black text-xl text-[#1C1917] leading-tight max-w-[240px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            {item.name}
          </h1>
          <span className="font-serif font-black text-lg text-[#1C1917]">
            {formatCurrency(item.base_price_paise)}
          </span>
        </div>

        <p className="text-xs text-[#7E756B] mb-4 leading-relaxed">
          {item.description || 'Juicy patty, fresh lettuce, tomato, onion, special sauce.'}
        </p>

        {/* Add Extras Section with 3D cards */}
        <div className="pt-3 border-t border-[#E8DDCF]">
          <div className="flex items-baseline space-x-1 mb-3">
            <h3 className="font-serif font-bold text-sm text-[#1C1917]">Add Extras</h3>
            <span className="text-[11px] text-[#7E756B]">(Optional)</span>
          </div>

          <div className="space-y-2">
            {availableAddons.map((addon) => {
              const isChecked = selectedAddons.some((a) => a.id === addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => handleToggleAddon(addon)}
                  className="flex items-center justify-between text-xs cursor-pointer select-none py-2 px-3 rounded-xl bg-[#FAF4EC] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(28,25,23,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:bg-[#EFE5D8]/50 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    {/* 3D Checkbox */}
                    <div
                      className={`w-4 h-4 rounded-xs border flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-[0_2px_5px_rgba(28,25,23,0.35)]'
                          : 'border-[#1C1917]/40 bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[#1C1917] font-semibold">{addon.name}</span>
                  </div>
                  <span className="text-[#7E756B] font-medium">+{formatCurrency(addon.price_paise)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar: 3D Stepper & Add to Cart */}
      <div className="pt-4 border-t border-[#E8DDCF] flex items-center space-x-3">
        {/* 3D Stepper */}
        <div className="flex items-center space-x-2.5 bg-[#EFE5D8] rounded-xl px-3 py-2.5 border border-[#E2D5C3] shadow-[inset_0_2px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(255,255,255,0.8)]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <span className="font-bold text-xs text-[#1C1917] w-4 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* 3D CTA Button */}
        <button
          onClick={() => onConfirm(item, selectedAddons, quantity)}
          className="flex-1 py-3.5 px-4 bg-[#1C1917] text-[#F7EFE3] font-bold text-xs rounded-xl shadow-[0_10px_24px_-4px_rgba(28,25,23,0.4),0_4px_8px_-2px_rgba(28,25,23,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.5)] active:scale-98 transition flex items-center justify-center"
        >
          Add to Cart • {formatCurrency(grandTotalPaise)}
        </button>
      </div>
    </div>
  );
};
