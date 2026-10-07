import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { CartItem, CartCalculation, SelectedAddon } from '../types/order.types';
import type { MenuItem } from '../types/menu.types';

export interface CartContextValue {
  items: CartItem[];
  calculation: CartCalculation;
  addItem: (
    item: MenuItem,
    variantId?: string,
    selectedAddons?: SelectedAddon[],
    specialInstructions?: string,
    quantity?: number
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  getItemQuantity: (itemId: string) => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export interface CartProviderProps {
  children: React.ReactNode;
  taxRatePercent?: number;
  serviceChargePercent?: number;
}

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  taxRatePercent = 5.0,
  serviceChargePercent = 0.0,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('qizine_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('qizine_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [items]);

  const addItem = useCallback(
    (
      item: MenuItem,
      variantId?: string,
      selectedAddons: SelectedAddon[] = [],
      specialInstructions?: string,
      quantity = 1
    ) => {
      setItems((prev) => {
        // Find variant if specified
        let unitPrice = item.base_price_paise;
        let variantName: string | undefined;

        if (variantId && item.variants && item.variants.length > 0) {
          const selectedVar = item.variants.find((v) => v.id === variantId);
          if (selectedVar) {
            unitPrice = selectedVar.price_paise;
            variantName = selectedVar.name;
          }
        }

        // Add add-on prices to unit calculation
        const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
        const itemUnitPrice = unitPrice + addonTotal;

        // Generate consistent signature for item + variant + addons
        const addonKey = selectedAddons.map((a) => a.id).sort().join('_');
        const cartItemId = `${item.id}-${variantId || 'base'}-${addonKey}-${specialInstructions || ''}`;

        const existingIndex = prev.findIndex((i) => i.cart_item_id === cartItemId);

        if (existingIndex > -1) {
          const updated = [...prev];
          const current = updated[existingIndex];
          const newQty = current.quantity + quantity;
          updated[existingIndex] = {
            ...current,
            quantity: newQty,
            total_price_paise: newQty * itemUnitPrice,
          };
          return updated;
        }

        const newItem: CartItem = {
          cart_item_id: cartItemId,
          item_id: item.id,
          name: item.name,
          diet_type: item.diet_type,
          image_url: item.images && item.images.length > 0 ? item.images[0].url : undefined,
          variant_id: variantId,
          variant_name: variantName,
          unit_price_paise: itemUnitPrice,
          quantity,
          selected_addons: selectedAddons,
          special_instructions: specialInstructions,
          total_price_paise: quantity * itemUnitPrice,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.cart_item_id !== cartItemId);
      }
      return prev.map((item) => {
        if (item.cart_item_id === cartItemId) {
          return {
            ...item,
            quantity,
            total_price_paise: item.unit_price_paise * quantity,
          };
        }
        return item;
      });
    });
  }, []);

  const getItemQuantity = useCallback(
    (itemId: string) => {
      return items
        .filter((item) => item.item_id === itemId)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [items]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Compute cart totals
  const calculation: CartCalculation = useMemo(() => {
    const subtotal_paise = items.reduce((sum, item) => sum + item.total_price_paise, 0);
    const tax_paise = Math.round(subtotal_paise * (taxRatePercent / 100));
    const service_charge_paise = Math.round(subtotal_paise * (serviceChargePercent / 100));
    const discount_paise = 0;
    const grand_total_paise = subtotal_paise + tax_paise + service_charge_paise - discount_paise;
    const total_items_count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal_paise,
      tax_rate_percent: taxRatePercent,
      tax_paise,
      service_charge_percent: serviceChargePercent,
      service_charge_paise,
      discount_paise,
      grand_total_paise,
      total_items_count,
    };
  }, [items, taxRatePercent, serviceChargePercent]);

  const value = useMemo(
    () => ({
      items,
      calculation,
      addItem,
      removeItem,
      updateQuantity,
      getItemQuantity,
      clearCart,
    }),
    [items, calculation, addItem, removeItem, updateQuantity, getItemQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
