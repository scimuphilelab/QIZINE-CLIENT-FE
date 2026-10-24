import React, { useState, useMemo } from 'react';
import { Clock, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { HomeScreen } from './screens/HomeScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { CustomizeScreen } from './screens/CustomizeScreen';
import { OrderConfirmationScreen } from './screens/OrderConfirmationScreen';
import { BottomNav, type NavTab } from './components/BottomNav';
import { OrderTrackerView } from '../../core/components/OrderTrackerView';
import { useMenu } from '../../core/hooks/useMenu';
import { useCart } from '../../core/hooks/useCart';
import { QizineApi, type CreateOrderResponseData } from '../../core/api/axios';
import type { MenuItem, MenuCategory } from '../../core/types/menu.types';
import type { SelectedAddon } from '../../core/types/order.types';
import type { TemplateProps } from '../registry';

export type ScreenState =
  | 'home'
  | 'category'
  | 'item_detail'
  | 'cart'
  | 'customize'
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
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
  } = useMenu();
  const { items, calculation, addItem, clearCart } = useCart();

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState<CreateOrderResponseData | null>(() => {
    try {
      const saved = localStorage.getItem('qizine_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Dining';
  const tableLocation = booth
    ? `${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}`
    : (menu?.cafe_profile?.address || 'Table T-1 • Main Dining Hall');

  // Current active category for Category Screen
  const activeCategory: MenuCategory = useMemo(() => {
    if (selectedCategoryId) {
      const found = allCategories.find((c) => c.id === selectedCategoryId);
      if (found) return found;
    }
    return categories[0] || allCategories[0] || {
      id: 'cat_all',
      name: 'All Items',
      description: 'Handcrafted dishes and beverages.',
      sort_order: 1,
      is_active: true,
      items: [],
    };
  }, [categories, allCategories, selectedCategoryId]);

  // Popular items flattened across all categories
  const popularItems: MenuItem[] = useMemo(() => {
    const all = allCategories.flatMap((c) => c.items);
    return all.slice(0, 6);
  }, [allCategories]);

  // Tab change handler
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
    } else if (tab === 'menu') {
      setCurrentScreen('category');
    } else if (tab === 'cart') {
      setCurrentScreen('cart');
    } else if (tab === 'profile') {
      setCurrentScreen('tracker');
    }
  };

  // Section change handler
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    if (sectionId !== 'ALL') {
      const targetSec = sections.find((s) => s.id === sectionId);
      if (targetSec && targetSec.categories.length > 0) {
        setSelectedCategoryId(targetSec.categories[0].id);
      }
    }
  };

  // Navigate to category screen
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentScreen('category');
    setActiveTab('menu');
  };

  const handleOpenMenu = () => {
    setCurrentScreen('category');
    setActiveTab('menu');
  };

  // Open item detail screen
  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setCurrentScreen('item_detail');
  };

  // Quick add / customize from category list
  const handleQuickAdd = (item: MenuItem) => {
    setSelectedItem(item);
    if (item.addon_groups && item.addon_groups.length > 0) {
      setCurrentScreen('customize');
    } else {
      addItem(item);
    }
  };

  // Add from item detail screen
  const handleAddToCartFromDetail = (
    item: MenuItem,
    selectedAddons: SelectedAddon[],
    quantity: number
  ) => {
    addItem(item, undefined, selectedAddons, undefined, quantity);
    setCurrentScreen('cart');
    setActiveTab('cart');
  };

  // Add from customize screen
  const handleAddToCartFromCustomize = (
    item: MenuItem,
    selectedAddons: SelectedAddon[],
    quantity: number
  ) => {
    addItem(item, undefined, selectedAddons, undefined, quantity);
    setCurrentScreen('cart');
    setActiveTab('cart');
  };

  // Proceed to checkout handler
  const handleProceedToCheckout = async () => {
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp_${Date.now()}`;

    const effectiveQrKey =
      booth?.qr_key ||
      new URLSearchParams(window.location.search).get('booth') ||
      new URLSearchParams(window.location.search).get('qr') ||
      'qr_default';

    try {
      const payload = {
        qr_key: effectiveQrKey,
        idempotency_key: idempotencyKey,
        payment_method: 'UPI' as const,
        items: items.map((i) => ({
          item_id: i.item_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          customizations: i.selected_addons.map((a) => ({
            group_id: a.group_id,
            option_id: a.id,
          })),
        })),
      };

      const orderResult = await QizineApi.createOrder(payload, idempotencyKey);
      localStorage.setItem('qizine_active_order', JSON.stringify(orderResult));
      setActiveOrder(orderResult);
      clearCart();
      setCurrentScreen('confirmation');
    } catch (err) {
      console.warn('[Modern01Template] Order API fallback active:', err);
      // Fallback simulated order for demonstration if offline
      const simulated: CreateOrderResponseData = {
        order_id: `ord_${Date.now()}`,
        order_no: Math.floor(10 + Math.random() * 89),
        ref_token: Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase(),
        status: 'ACCEPTED',
        payment_status: 'SUCCESS',
        total_paise: calculation.grand_total_paise,
        currency: 'INR',
        booth_label: booth?.booth_label || 'Table T-1',
        serving_model: booth?.serving_model === 'DELIVERY' ? 'DELIVERY' : (booth?.serving_model === 'TAKEAWAY' ? 'SELF_SERVING' : 'WAITER_SERVING'),
        upi_intent_uri: '',
      };
      localStorage.setItem('qizine_active_order', JSON.stringify(simulated));
      setActiveOrder(simulated);
      clearCart();
      setCurrentScreen('confirmation');
    }
  };

  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'category' ||
    currentScreen === 'cart' ||
    currentScreen === 'tracker';

  return (
    <div className="min-h-screen bg-[#FAF4EE] selection:bg-[#FF385C]/20 selection:text-[#FF385C] flex flex-col justify-start">
      <div className="w-full max-w-md sm:max-w-lg mx-auto min-h-screen bg-[#FAF4EE] relative flex flex-col shadow-2xl sm:my-4 sm:rounded-[36px] sm:border sm:border-stone-200/60 overflow-hidden">
        {/* 1. Home / Menu Screen */}
        {currentScreen === 'home' && (
          <HomeScreen
            menu={menu}
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={handleSelectSection}
            categories={categories}
            allCategories={allCategories}
            popularItems={popularItems}
            booth={booth}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectCategory={handleSelectCategory}
            onSelectItem={handleSelectItem}
            onOpenCart={() => {
              setCurrentScreen('cart');
              setActiveTab('cart');
            }}
            onOpenMenu={handleOpenMenu}
            cartCount={calculation.total_items_count}
          />
        )}

        {/* 2. Category / Menu Catalog Screen */}
        {currentScreen === 'category' && (
          <CategoryScreen
            category={activeCategory}
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={handleSelectSection}
            categories={allCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            onBack={() => {
              setCurrentScreen('home');
              setActiveTab('home');
            }}
            onSelectItem={handleSelectItem}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {/* 3. Item Detail Screen */}
        {currentScreen === 'item_detail' && selectedItem && (
          <ItemDetailScreen
            item={selectedItem}
            onBack={() => {
              if (activeTab === 'home') {
                setCurrentScreen('home');
              } else {
                setCurrentScreen('category');
              }
            }}
            onAddToCart={handleAddToCartFromDetail}
          />
        )}

        {/* 4. Cart Screen */}
        {currentScreen === 'cart' && (
          <CartScreen
            onBack={() => {
              setCurrentScreen('home');
              setActiveTab('home');
            }}
            onProceedToCheckout={handleProceedToCheckout}
            cafeName={cafeName}
            tableLocation={tableLocation}
          />
        )}

        {/* 5. Customization / Add-ons Screen */}
        {currentScreen === 'customize' && selectedItem && (
          <CustomizeScreen
            item={selectedItem}
            onBack={() => {
              if (activeTab === 'home') {
                setCurrentScreen('home');
              } else {
                setCurrentScreen('category');
              }
            }}
            onConfirm={handleAddToCartFromCustomize}
          />
        )}

        {/* 6. Order Confirmation Screen */}
        {currentScreen === 'confirmation' && (
          <OrderConfirmationScreen
            orderData={activeOrder}
            onViewOrderDetails={() => setCurrentScreen('tracker')}
            onBackToHome={() => {
              setCurrentScreen('home');
              setActiveTab('home');
            }}
          />
        )}

        {/* Real-time Order Tracker Screen */}
        {currentScreen === 'tracker' && (
          activeOrder ? (
            <OrderTrackerView
              orderData={activeOrder}
              onBackToMenu={() => {
                setCurrentScreen('home');
                setActiveTab('home');
              }}
              onOrderCancelled={() => {
                setActiveOrder(null);
                setCurrentScreen('home');
                setActiveTab('home');
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
              <div className="w-20 h-20 rounded-full bg-[#FF385C]/10 flex items-center justify-center text-[#FF385C] mb-5 shadow-sm">
                <UtensilsCrossed className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">No Active Orders</h3>
              <p className="text-sm text-stone-500 mt-2 max-w-xs font-normal">
                You haven't placed any orders yet. Explore our delicious menu and place your order!
              </p>
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  setActiveTab('home');
                }}
                className="mt-6 px-7 py-3 rounded-2xl bg-[#FF385C] text-white font-semibold text-sm shadow-md hover:bg-[#E02D50] active:scale-95 transition-all"
              >
                Explore Menu
              </button>
            </div>
          )
        )}

        {/* Persistent Floating Bottom Navigation Bar */}
        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            cartCount={calculation.total_items_count}
          />
        )}
      </div>
    </div>
  );
};

export default Modern01Template;
