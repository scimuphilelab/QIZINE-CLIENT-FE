import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from 'antd';
import { X, Check, Plus, Minus } from 'lucide-react';
import type { MenuItem, MenuItemVariant, MenuItemAddonGroup, MenuItemAddon } from '../types/menu.types';
import type { SelectedAddon } from '../types/order.types';
import { useCart } from '../hooks/useCart';

export interface CustomizationModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    item: MenuItem,
    variantId?: string,
    selectedAddons?: SelectedAddon[],
    specialInstructions?: string,
    quantity?: number
  ) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  open,
  onClose,
  onConfirm,
}) => {
  const { formatCurrency } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize defaults whenever modal opens for an item
  useEffect(() => {
    if (item) {
      // Default variant
      if (item.variants && item.variants.length > 0) {
        const defaultVar =
          item.variants.find((v) => v.is_default && v.in_stock) ||
          item.variants.find((v) => v.in_stock) ||
          item.variants[0];
        setSelectedVariantId(defaultVar ? defaultVar.id : '');
      } else {
        setSelectedVariantId('');
      }

      setSelectedAddons([]);
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [item, open]);

  if (!item) return null;

  const isVeg = item.diet_type === 'VEG' || item.diet_type === 'VEGAN';

  // Calculate live dynamic price
  const activeVariant = item.variants?.find((v) => v.id === selectedVariantId);
  const basePrice = activeVariant ? activeVariant.price_paise : item.base_price_paise;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const unitTotal = basePrice + addonsTotal;
  const grandTotal = unitTotal * quantity;

  // Validate addon constraints (min selection per group)
  const validationError = useMemo(() => {
    if (!item.addon_groups) return null;
    for (const group of item.addon_groups) {
      const count = selectedAddons.filter((a) => a.group_id === group.id).length;
      if (group.min_selection > 0 && count < group.min_selection) {
        return `Please select at least ${group.min_selection} option(s) for "${group.title}"`;
      }
    }
    return null;
  }, [item.addon_groups, selectedAddons]);

  const handleToggleAddon = (group: MenuItemAddonGroup, addon: MenuItemAddon) => {
    const existing = selectedAddons.some((a) => a.id === addon.id);

    if (existing) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      const groupCount = selectedAddons.filter((a) => a.group_id === group.id).length;
      if (group.max_selection > 0 && groupCount >= group.max_selection) {
        // If single-choice max_selection === 1, replace previous selection
        if (group.max_selection === 1) {
          setSelectedAddons((prev) => [
            ...prev.filter((a) => a.group_id !== group.id),
            {
              id: addon.id,
              name: addon.name,
              price_paise: addon.price_paise,
              group_id: group.id,
            },
          ]);
          return;
        }
        return; // Max reached
      }

      setSelectedAddons((prev) => [
        ...prev,
        {
          id: addon.id,
          name: addon.name,
          price_paise: addon.price_paise,
          group_id: group.id,
        },
      ]);
    }
  };

  const handleConfirm = () => {
    if (validationError) return;
    onConfirm(
      item,
      selectedVariantId || undefined,
      selectedAddons,
      specialInstructions.trim() || undefined,
      quantity
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={460}
      className="p-0 overflow-hidden rounded-3xl"
    >
      <div className="bg-surface text-gray-900 rounded-3xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-black/5 flex items-start justify-between bg-surface-alt">
          <div className="flex-1 pr-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span
                className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                  isVeg ? 'border-green-600' : 'border-red-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-green-600' : 'bg-red-600'
                  }`}
                />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Customise Dish
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900 leading-tight">
              {item.name}
            </h3>
            <p className="text-xs font-semibold text-primary mt-0.5">
              Base: {formatCurrency(item.base_price_paise)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Variants (Radio Selection) */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Size / Portion
                </h4>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {item.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-black/10 hover:border-black/20 bg-surface'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-medium text-gray-800">
                          {variant.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        {formatCurrency(variant.price_paise)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-on Groups (Checkboxes) */}
          {item.addon_groups &&
            item.addon_groups.map((group) => {
              const currentCount = selectedAddons.filter((a) => a.group_id === group.id).length;
              return (
                <div key={group.id} className="space-y-2.5 pt-2 border-t border-black/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        {group.title}
                      </h4>
                      <p className="text-[10px] text-muted">
                        {group.min_selection > 0
                          ? `Choose at least ${group.min_selection}`
                          : `Optional (up to ${group.max_selection || 'any'})`}
                      </p>
                    </div>
                    {group.min_selection > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Required ({currentCount}/{group.min_selection})
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.addons.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => handleToggleAddon(group, addon)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-xs'
                              : 'border-black/10 hover:border-black/20 bg-surface'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-medium text-gray-800">
                              {addon.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-primary">
                            +{formatCurrency(addon.price_paise)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Cooking Note */}
          <div className="pt-2 border-t border-black/5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Special Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, no onion, extra crispy..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition"
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer with Quantity Stepper & Add Action */}
        <div className="p-4 border-t border-black/5 bg-surface-alt flex items-center justify-between space-x-3">
          {/* Quantity Stepper */}
          <div className="flex items-center space-x-2 bg-surface border border-black/10 rounded-xl px-2 py-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 text-gray-500 hover:text-gray-900 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!!validationError}
            className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-soft flex items-center justify-between hover:opacity-95 transition disabled:opacity-50"
          >
            <span className="text-xs uppercase tracking-wider">Add to Cart</span>
            <span className="text-xs font-bold">{formatCurrency(grandTotal)}</span>
          </button>
        </div>

        {validationError && (
          <div className="px-4 pb-2 text-center">
            <p className="text-[11px] text-red-500 font-semibold">{validationError}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
