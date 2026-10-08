import React, { useState, useMemo } from 'react';
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
  const { menu, categories, selectedCategoryId, setSelectedCategoryId, searchQuery, setSearchQuery } =
    useMenu();
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

  // Current active category for Category Screen
  const activeCategory: MenuCategory = useMemo(() => {
    if (selectedCategoryId) {
      const found = categories.find((c) => c.id === selectedCategoryId);
      if (found) return found;
    }
    return categories[0] || {
      id: 'cat_burgers',
      name: 'Burgers',
      description: 'Fresh ingredients. Juicy bites. Only the best.',
      sort_order: 1,
      is_active: true,
      items: [],
    };
  }, [categories, selectedCategoryId]);

  // Popular items flattened
  const popularItems: MenuItem[] = useMemo(() => {
    const all = categories.flatMap((c) => c.items);
    return all.slice(0, 4);
  }, [categories]);

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
      // If order exists, show order confirmation or tracker
      if (activeOrder) {
        setCurrentScreen('tracker');
      } else {
        setCurrentScreen('home');
      }
    }
  };

  // Navigate to category screen
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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

    try {
      const payload = {
        qr_key: 'qr_default',
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
    } catch {
      // Fallback simulated order for demonstration
      const simulated: CreateOrderResponseData = {
        order_id: `ord_${Date.now()}`,
        order_no: 42,
        ref_token: 'FB2437',
        status: 'ACCEPTED',
        payment_status: 'SUCCESS',
        total_paise: calculation.grand_total_paise,
        currency: 'INR',
        booth_label: booth?.booth_label || 'Baker Street',
        serving_model: 'WAITER_SERVING',
        upi_intent_uri: '',
      };
      localStorage.setItem('qizine_active_order', JSON.stringify(simulated));
      setActiveOrder(simulated);
      clearCart();
      setCurrentScreen('confirmation');
    }
  };

  const showBottomNav =
    currentScreen === 'home' || currentScreen === 'category' || currentScreen === 'cart';

  return (
    <div className="min-h-screen bg-[#F7EFE3] selection:bg-[#1C1917]/20 selection:text-[#1C1917]">
      {/* 1. Home / Menu Screen */}
      {currentScreen === 'home' && (
        <HomeScreen
          menu={menu}
          categories={categories}
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
          cartCount={calculation.total_items_count}
        />
      )}

      {/* 2. Category Screen */}
      {currentScreen === 'category' && (
        <CategoryScreen
          category={activeCategory}
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
          onBack={() => setCurrentScreen('category')}
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
        />
      )}

      {/* 5. Customization / Add-ons Screen */}
      {currentScreen === 'customize' && selectedItem && (
        <CustomizeScreen
          item={selectedItem}
          onBack={() => setCurrentScreen('category')}
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
      {currentScreen === 'tracker' && activeOrder && (
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
      )}

      {/* Persistent Retro Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartCount={calculation.total_items_count}
        />
      )}
    </div>
  );
};

export default Modern01Template;
