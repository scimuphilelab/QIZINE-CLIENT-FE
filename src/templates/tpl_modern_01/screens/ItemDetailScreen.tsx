import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Check,
  Flame,
  Clock,
  ImageOff,
  Sparkles,
} from 'lucide-react';
import type { MenuItem, MenuItemAddon } from '../../../core/types/menu.types';
import type { SelectedAddon } from '../../../core/types/order.types';
import { DietBadge } from '../components/DietBadge';
import { useCart } from '../../../core/hooks/useCart';

export interface ItemDetailScreenProps {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (
    item: MenuItem,
    variantId: string | undefined,
    selectedAddons: SelectedAddon[],
    quantity: number,
    specialInstructions?: string
  ) => void;
}

export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  item,
  onBack,
  onAddToCart,
}) => {
  const { formatCurrency } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

  // Variants selection
  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const defaultVar = hasVariants
    ? item.variants!.find((v) => v.is_default) || item.variants![0]
    : undefined;
  const [selectedVariant, setSelectedVariant] = useState(defaultVar);

  // Addon Groups & Selections
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  // Extract all addon groups
  const addonGroups = item.addon_groups || [];

  const handleToggleAddon = (groupTitle: string, groupId: string, addon: MenuItemAddon, maxSelection: number = 1) => {
    const isAlreadySelected = selectedAddons.some((a) => a.id === addon.id);

    if (isAlreadySelected) {
      // Remove
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      // If single selection allowed, remove other addons from the same group
      if (maxSelection === 1) {
        setSelectedAddons((prev) => [
          ...prev.filter((a) => a.group_id !== groupId),
          {
            id: addon.id,
            name: addon.name,
            price_paise: addon.price_paise,
            group_id: groupId,
          },
        ]);
      } else {
        // Multi-selection: Check if maxSelection reached
        const groupCount = selectedAddons.filter((a) => a.group_id === groupId).length;
        if (groupCount < maxSelection) {
          setSelectedAddons((prev) => [
            ...prev,
            {
              id: addon.id,
              name: addon.name,
              price_paise: addon.price_paise,
              group_id: groupId,
            },
          ]);
        }
      }
    }
  };

  // Price Calculation
  const baseUnitPricePaise = selectedVariant
    ? selectedVariant.price_paise
    : item.base_price_paise;
  const addonTotalPaise = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const totalUnitPricePaise = baseUnitPricePaise + addonTotalPaise;
  const grandTotalPaise = totalUnitPricePaise * quantity;

  const handleAdd = () => {
    onAddToCart(
      item,
      selectedVariant?.id,
      selectedAddons,
      quantity,
      specialInstructions.trim() || undefined
    );
  };

  const imageUrl = item.images && item.images.length > 0 ? item.images[0]?.url : undefined;
  const hasValidImage = Boolean(imageUrl && imageUrl.trim().length > 0 && !imgError);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900 font-sans flex flex-col justify-between selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      <div>
        {/* Top Header Row with Circular Back Button */}
        <header className="sticky top-0 z-30 bg-[#FAF9F7]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between border-b border-stone-200/50">
          <button
            onClick={onBack}
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition cursor-pointer"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="font-extrabold text-sm text-stone-600 truncate max-w-[200px]">
            {item.name}
          </span>
          <div className="w-10 h-10" />
        </header>

        {/* Hero Image Section */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          {hasValidImage ? (
            <div className="w-full h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md bg-stone-100 border border-stone-200/60 relative">
              <img
                src={imageUrl!}
                alt={item.name}
                loading="eager"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          ) : (
            <div className="w-full h-44 sm:h-48 rounded-3xl bg-stone-100 border border-stone-200/70 flex flex-col items-center justify-center text-stone-400 select-none">
              <ImageOff className="w-8 h-8 stroke-[1.8] text-stone-400 mb-2" />
              <p className="text-xs font-bold text-stone-400">No preview available</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Freshly prepared to order</p>
            </div>
          )}
        </div>

        {/* Dish Main Details Card */}
        <div className="px-4 sm:px-6 py-4 space-y-5">
          {/* Title, Veg indicator & Price */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <DietBadge dietType={item.diet_type} size="md" />
              <span className="text-xs font-extrabold uppercase tracking-wide text-stone-500">
                {item.diet_type === 'VEG'
                  ? 'Pure Veg'
                  : item.diet_type === 'VEGAN'
                  ? 'Vegan'
                  : item.diet_type === 'EGG'
                  ? 'Contains Egg'
                  : 'Non-Vegetarian'}
              </span>
            </div>

            <h1 className="font-heading font-black text-xl sm:text-2xl text-stone-900 leading-tight tracking-tight">
              {item.name}
            </h1>

            <div className="text-lg sm:text-xl font-heading font-black text-[#FF5722]">
              {formatCurrency(totalUnitPricePaise)}
            </div>
          </div>

          {/* Badges: Prep Time, Spice Level, Allergens */}
          <div className="flex flex-wrap items-center gap-2">
            {item.prep_time_minutes ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{item.prep_time_minutes} mins prep</span>
              </span>
            ) : null}

            {item.spice_level ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Spice Level {item.spice_level}</span>
              </span>
            ) : null}

            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Description */}
          {item.description ? (
            <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-1">
                Description
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ) : null}

          {/* Allergens Info */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200/50">
              <p className="text-xs font-bold text-amber-800">
                ⚠️ Allergen Information: {item.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Variants / Portion Selection (if item has variants) */}
          {hasVariants && (
            <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-extrabold text-sm text-stone-900 tracking-tight">
                  Choose Portion / Size
                </h2>
                <span className="text-[10px] font-heading font-black uppercase text-[#FF5722] bg-[#FFF4EE] px-2 py-0.5 rounded-md">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {item.variants!.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#FF5722] bg-[#FFF4EE] shadow-xs ring-1 ring-[#FF5722]'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className={`text-xs sm:text-sm font-heading font-black truncate ${
                            isSelected ? 'text-[#FF5722]' : 'text-stone-900'
                          }`}
                        >
                          {variant.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#FF5722] bg-[#FF5722]'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-xs font-heading font-black text-stone-800">
                        {formatCurrency(variant.price_paise)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons & Customizations */}
          {addonGroups.length > 0 &&
            addonGroups.map((group) => {
              const options = group.options || group.addons || [];
              if (options.length === 0) return null;

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-sm text-stone-900 tracking-tight">
                        {group.title}
                      </h2>
                      <p className="text-[11px] text-stone-400">
                        {group.max_selection === 1
                          ? 'Select 1 option'
                          : `Select up to ${group.max_selection} options`}
                      </p>
                    </div>
                    {group.is_required && (
                      <span className="text-[10px] font-black uppercase text-[#FF5722] bg-[#FFF4EE] px-2 py-0.5 rounded-md">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {options.map((addon) => {
                      const isChecked = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleToggleAddon(
                              group.title,
                              group.id,
                              addon,
                              group.max_selection || 1
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleToggleAddon(
                                group.title,
                                group.id,
                                addon,
                                group.max_selection || 1
                              );
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'border-[#FF5722] bg-[#FFF4EE] text-stone-900 shadow-2xs'
                              : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold">{addon.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-stone-700">
                              +{formatCurrency(addon.price_paise)}
                            </span>
                            <div
                              className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-[#FF5722] text-white'
                                  : 'border border-stone-300 bg-white'
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
              );
            })}

          {/* Kitchen Special Instructions Textarea */}
          <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-2xs space-y-1.5">
            <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-500">
              Special Instructions for Chef
            </h2>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, dressing on side, no onions..."
              className="w-full text-xs sm:text-sm text-stone-800 bg-stone-50 rounded-xl p-2.5 border border-stone-200 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/20 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar: Stepper & Add to Basket Button */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-stone-200/70 p-4 sm:px-6 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {/* Quantity Stepper */}
        <div className="flex items-center space-x-3 bg-stone-100 border border-stone-200/80 rounded-2xl px-3 py-2 shrink-0">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-90 transition cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <span className="font-heading font-black text-sm text-stone-900 min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-90 transition cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Add to Basket CTA */}
        <button
          onClick={handleAdd}
          type="button"
          className="flex-1 py-3.5 px-5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-heading font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-between cursor-pointer"
        >
          <span>Add to Basket</span>
          <span>{formatCurrency(grandTotalPaise)}</span>
        </button>
      </div>
    </div>
  );
};

export default ItemDetailScreen;
