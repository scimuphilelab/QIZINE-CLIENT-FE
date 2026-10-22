import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Header } from './components/Header';
import { ItemCard } from './components/ItemCard';
import { CustomizationModal } from '../../core/components/CustomizationModal';
import { CartDrawer } from '../../core/components/CartDrawer';
import { UpiPaymentModal } from '../../core/components/UpiPaymentModal';
import { OrderTrackerView } from '../../core/components/OrderTrackerView';
import { WaiterCallModal } from '../../core/components/WaiterCallModal';
import { useMenu } from '../../core/hooks/useMenu';
import { useCart } from '../../core/hooks/useCart';
import type { MenuItem } from '../../core/types/menu.types';
import type { CreateOrderResponseData } from '../../core/api/axios';
import type { TemplateProps } from '../registry';

export const SwiggyModernTemplate: React.FC<TemplateProps> = ({ booth }) => {
  const {
    sections,
    selectedSectionId,
    setSelectedSectionId,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    categoriesWithFilteredItems,
  } = useMenu();
  const { hasItems, calculation, formatCurrency, addItem } = useCart();

  // Modals and Drawers state
  const [customiseItem, setCustomiseItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [upiOrderData, setUpiOrderData] = useState<CreateOrderResponseData | null>(null);
  const [activeOrder, setActiveOrder] = useState<CreateOrderResponseData | null>(() => {
    try {
      const saved = localStorage.getItem('qizine_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // If user has an active order, render View 6 Live Order Tracker
  if (activeOrder) {
    return (
      <OrderTrackerView
        orderData={activeOrder}
        onBackToMenu={() => setActiveOrder(null)}
        onOrderCancelled={() => setActiveOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 font-sans selection:bg-primary/20 selection:text-primary">
      {/* View 2: Header */}
      <Header booth={booth} onOpenWaiterCall={() => setWaiterModalOpen(true)} />

      {/* Sticky Category & Section Bar with Active Indicators */}
      <nav className="sticky top-[115px] z-20 bg-background/90 backdrop-blur-md border-b border-black/5 py-2 space-y-1.5">
        {sections.length > 1 && (
          <div className="max-w-xl mx-auto px-4 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSectionId('ALL')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedSectionId === 'ALL'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-surface text-gray-700 hover:bg-gray-100 border border-black/5'
              }`}
            >
              All Menus
            </button>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedSectionId === sec.id
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-surface text-gray-700 hover:bg-gray-100 border border-black/5'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-surface text-gray-700 hover:bg-gray-100 border border-black/5'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Primary Menu Item Feed */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-6">
        {categoriesWithFilteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xs text-muted">No dishes found matching your current filter.</p>
          </div>
        ) : (
          categoriesWithFilteredItems.map((category) => (
            <section key={category.id} className="space-y-3">
              <div>
                <h2 className="font-heading font-bold text-base text-gray-900">
                  {category.name} ({category.items.length})
                </h2>
                {category.description && (
                  <p className="text-xs text-muted mt-0.5">{category.description}</p>
                )}
              </div>

              <div className="space-y-2.5">
                {category.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpenCustomise={(target) => setCustomiseItem(target)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Swiggy Spring Floating Cart Bar */}
      <AnimatePresence>
        {hasItems && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-2xl shadow-floating flex items-center justify-between hover:opacity-95 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {calculation.total_items_count}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">View Cart</p>
                  <p className="text-xs font-medium opacity-90">
                    {formatCurrency(calculation.grand_total_paise)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold">
                <span>Review Order</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View 3: Customization Bottom Sheet */}
      <CustomizationModal
        item={customiseItem}
        open={!!customiseItem}
        onClose={() => setCustomiseItem(null)}
        onConfirm={(item, variantId, addons, note, qty) => {
          addItem(item, variantId, addons, note, qty);
        }}
      />

      {/* View 4: Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        booth={booth}
        onOrderCreated={(order) => {
          setCartOpen(false);
          if (booth?.accept_order_type === 'PREPAID') {
            setUpiOrderData(order);
          } else {
            setActiveOrder(order);
          }
        }}
      />

      {/* View 5: UPI Intent Modal */}
      <UpiPaymentModal
        open={!!upiOrderData}
        orderData={upiOrderData}
        onClose={() => setUpiOrderData(null)}
        onSuccess={() => {
          if (upiOrderData) {
            setActiveOrder(upiOrderData);
            setUpiOrderData(null);
          }
        }}
      />

      {/* View 8: Waiter Call Modal */}
      <WaiterCallModal
        open={waiterModalOpen}
        onClose={() => setWaiterModalOpen(false)}
        booth={booth}
      />
    </div>
  );
};

export default SwiggyModernTemplate;
