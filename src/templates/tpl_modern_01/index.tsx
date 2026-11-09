import React, { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { OrderConfirmationScreen } from './screens/OrderConfirmationScreen';
import { OrderTrackerView } from '../../core/components/OrderTrackerView';
import { useMenu } from '../../core/hooks/useMenu';
import { useCart } from '../../core/hooks/useCart';
import { QizineApi, type CreateOrderResponseData } from '../../core/api/axios';
import type { MenuItem } from '../../core/types/menu.types';
import type { SelectedAddon } from '../../core/types/order.types';
import type { TemplateProps } from '../registry';

export type ScreenState =
  | 'home'
  | 'item_detail'
  | 'cart'
  | 'confirmation'
  | 'tracker';

export const Modern01Template: React.FC<TemplateProps> = ({ booth }) => {
  const {
    menu,
    sections,
    categories,
    allCategories,
    selectedSectionId,
    setSelectedSectionId,
    searchQuery,
    setSearchQuery,
  } = useMenu();
  const { items, calculation, addItem, clearCart } = useCart();

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Active Order State (persisted for user convenience upon order placement)
  const [activeOrder, setActiveOrder] = useState<CreateOrderResponseData | null>(() => {
    try {
      const saved = localStorage.getItem('qizine_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Restaurant';
  const tableLocation = booth?.booth_label
    ? `Table ${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}`
    : (menu?.cafe_profile?.address || '');

  // Open item detail screen
  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setCurrentScreen('item_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add from item detail screen
  const handleAddToCartFromDetail = (
    item: MenuItem,
    variantId: string | undefined,
    selectedAddons: SelectedAddon[],
    quantity: number,
    specialInstructions?: string
  ) => {
    addItem(item, variantId, selectedAddons, specialInstructions, quantity);
    setCurrentScreen('home');
  };

  // Submit order to kitchen backend API
  const handleProceedToCheckout = async () => {
    if (booth?.is_open === false) {
      setCheckoutError(
        `The restaurant is currently closed. ${
          booth.opening_time ? `Ordering resumes at ${booth.opening_time}.` : 'Please check back later.'
        }`
      );
      return;
    }

    if (items.length === 0) return;

    setIsSubmittingOrder(true);
    setCheckoutError(null);

    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp_${Date.now()}`;

    const effectiveQrKey =
      booth?.qr_key ||
      new URLSearchParams(window.location.search).get('qr_key') ||
      new URLSearchParams(window.location.search).get('booth') ||
      new URLSearchParams(window.location.search).get('qr') ||
      '';

    try {
      const payload = {
        qr_key: effectiveQrKey,
        idempotency_key: idempotencyKey,
        payment_method: 'UPI' as const,
        items: items.map((i) => {
          let finalVariantId = i.variant_id;
          if (!finalVariantId) {
            const catalogItem = allCategories.flatMap((c) => c.items).find((ci) => ci.id === i.item_id);
            if (catalogItem?.variants && catalogItem.variants.length > 0) {
              finalVariantId =
                catalogItem.variants.find((v) => v.is_default)?.id || catalogItem.variants[0].id;
            }
          }
          return {
            item_id: i.item_id,
            variant_id: finalVariantId,
            qty: i.quantity,
            quantity: i.quantity,
            addon_ids: i.selected_addons.map((a) => a.id),
            customizations: i.selected_addons.map((a) => ({
              group_id: a.group_id,
              option_id: a.id,
            })),
          };
        }),
      };

      const orderResult = await QizineApi.createOrder(payload, idempotencyKey);
      localStorage.setItem('qizine_active_order', JSON.stringify(orderResult));
      setActiveOrder(orderResult);
      clearCart();
      setCurrentScreen('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[Qizine] Order submission failed:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unable to send order to the kitchen. Please check connection and try again.';
      setCheckoutError(errMsg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] selection:bg-[#FF5722]/20 selection:text-[#FF5722] flex flex-col justify-start">
      <div className="w-full max-w-md sm:max-w-lg mx-auto min-h-screen bg-[#FAF9F7] relative flex flex-col shadow-2xl sm:my-4 sm:rounded-[36px] sm:border sm:border-stone-200/60 overflow-hidden">
        {/* Screen 1: Home / Menu List Screen */}
        {currentScreen === 'home' && (
          <HomeScreen
            menu={menu}
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            categories={categories}
            allCategories={allCategories}
            booth={booth}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectItem={handleSelectItem}
            onOpenCart={() => {
              setCurrentScreen('cart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTracker={() => {
              setCurrentScreen('tracker');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            hasActiveOrder={Boolean(activeOrder)}
            cartCount={calculation.total_items_count}
          />
        )}

        {/* Screen 2: Full Item Detail Screen */}
        {currentScreen === 'item_detail' && selectedItem && (
          <ItemDetailScreen
            item={selectedItem}
            onBack={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={handleAddToCartFromDetail}
          />
        )}

        {/* Screen 3: Cart / Review Screen */}
        {currentScreen === 'cart' && (
          <CartScreen
            onBack={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProceedToCheckout={handleProceedToCheckout}
            cafeName={cafeName}
            tableLocation={tableLocation}
            isOpen={booth?.is_open !== false}
            openingTime={booth?.opening_time}
            closingTime={booth?.closing_time}
            isSubmitting={isSubmittingOrder}
            errorMessage={checkoutError}
            onClearError={() => setCheckoutError(null)}
          />
        )}

        {/* Screen 4: Order Confirmation Screen */}
        {currentScreen === 'confirmation' && (
          <OrderConfirmationScreen
            orderData={activeOrder}
            onViewOrderDetails={() => {
              setCurrentScreen('tracker');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Screen 5: Live Order Tracker Screen */}
        {currentScreen === 'tracker' && (
          activeOrder ? (
            <OrderTrackerView
              orderData={activeOrder}
              onBackToMenu={() => {
                setCurrentScreen('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOrderCancelled={() => {
                setActiveOrder(null);
                setCurrentScreen('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-[#FFF4EE] flex items-center justify-center text-[#FF5722] mb-4 shadow-2xs">
                🍽️
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">No Active Orders</h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs font-normal">
                You do not have any active orders right now. Explore the menu and place your table order!
              </p>
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-6 px-6 py-3 rounded-2xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all"
              >
                Explore Menu
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Modern01Template;
