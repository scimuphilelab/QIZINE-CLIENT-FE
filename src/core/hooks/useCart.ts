import { useMemo, useCallback } from 'react';
import { useCartContext } from '../context/CartContext';
import type { MenuItem, MenuItemVariant, MenuItemAddon } from '../types/menu.types';
import type { SelectedAddon } from '../types/order.types';

export function useCart() {
  const cart = useCartContext();

  /**
   * Format paise to currency string (e.g. 18900 paise -> ₹189)
   */
  const formatCurrency = useCallback((paise: number, currencySymbol = '₹'): string => {
    const rupees = paise / 100;
    return `${currencySymbol}${rupees % 1 === 0 ? rupees : rupees.toFixed(2)}`;
  }, []);

  /**
   * Helper to resolve default variant for an item
   */
  const getDefaultVariant = useCallback((item: MenuItem): MenuItemVariant | undefined => {
    if (!item.variants || item.variants.length === 0) return undefined;
    return item.variants.find((v) => v.is_default && v.in_stock) || item.variants.find((v) => v.in_stock) || item.variants[0];
  }, []);

  /**
   * Validate addon constraints (min / max per addon group)
   */
  const validateAddonSelection = useCallback(
    (item: MenuItem, selectedAddons: SelectedAddon[]): { isValid: boolean; error?: string } => {
      if (!item.addon_groups || item.addon_groups.length === 0) {
        return { isValid: true };
      }

      for (const group of item.addon_groups) {
        const count = selectedAddons.filter((a) => a.group_id === group.id).length;
        if (group.min_selection > 0 && count < group.min_selection) {
          return {
            isValid: false,
            error: `Please select at least ${group.min_selection} ${group.title}`,
          };
        }
        if (group.max_selection > 0 && count > group.max_selection) {
          return {
            isValid: false,
            error: `You can select at most ${group.max_selection} ${group.title}`,
          };
        }
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Calculate single item preview price including variant & addons
   */
  const calculateItemPreviewPrice = useCallback(
    (item: MenuItem, variantId?: string, selectedAddons: MenuItemAddon[] = []): number => {
      let unitPrice = item.base_price_paise;
      if (variantId && item.variants) {
        const found = item.variants.find((v) => v.id === variantId);
        if (found) unitPrice = found.price_paise;
      }
      const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
      return unitPrice + addonsTotal;
    },
    []
  );

  const hasItems = useMemo(() => cart.items.length > 0, [cart.items.length]);

  return {
    ...cart,
    hasItems,
    formatCurrency,
    getDefaultVariant,
    validateAddonSelection,
    calculateItemPreviewPrice,
  };
}
