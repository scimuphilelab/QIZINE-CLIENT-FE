import React, { useState } from 'react';
import { useMenu } from '../../core/hooks/useMenu';
import { useCart } from '../../core/hooks/useCart';
import { ItemCard } from '../tpl_default/components/ItemCard';
import { CustomizationModal } from '../../core/components/CustomizationModal';
import { CartDrawer } from '../../core/components/CartDrawer';
import { UpiPaymentModal } from '../../core/components/UpiPaymentModal';
import { OrderTrackerView } from '../../core/components/OrderTrackerView';
import { WaiterCallModal } from '../../core/components/WaiterCallModal';
import type { MenuItem } from '../../core/types/menu.types';
import type { CreateOrderResponseData } from '../../core/api/axios';
import type { TemplateProps } from '../registry';
import { Flame, ShoppingCart, Bell } from 'lucide-react';

export const StreetBistroTemplate: React.FC<TemplateProps> = ({ booth }) => {
  const { menu, categories, selectedCategoryId, setSelectedCategoryId, categoriesWithFilteredItems } =
    useMenu();
  const { hasItems, calculation, formatCurrency, addItem } = useCart();

  const [customiseItem, setCustomiseItem] = useState<MenuItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    <div className="min-h-screen bg-[#FFF9F2] pb-28 text-gray-900 font-sans">
      {/* Bistro Header */}
      <header className="bg-[#E65100] text-white p-4 shadow-md sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <Flame className="w-5 h-5 text-amber-300" />
              <h1 className="text-xl font-black tracking-tight">{menu?.cafe_profile.name}</h1>
            </div>
            {booth && (
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                {booth.booth_label} • Street Quick Order
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setWaiterModalOpen(true)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
              title="Call Waiter"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="bg-amber-400 text-orange-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Chunky Bistro Category Pills */}
      <nav className="sticky top-[69px] z-20 bg-[#FFF9F2]/90 backdrop-blur-md border-b border-orange-100 py-2.5">
        <div className="max-w-xl mx-auto px-4 flex space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategoryId === c.id
                  ? 'bg-[#E65100] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-orange-200'
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Feed */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-5">
        {categoriesWithFilteredItems.map((cat) => (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-sm font-black text-orange-950 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E65100]" />
              <span>{cat.name}</span>
            </h2>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpenCustomise={(target) => setCustomiseItem(target)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart floating bar */}
      {hasItems && (
        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-xl mx-auto">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full bg-[#E65100] text-white py-3.5 px-4 rounded-2xl shadow-floating flex items-center justify-between font-black text-sm hover:opacity-95 transition"
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{calculation.total_items_count} items in Tray</span>
            </div>
            <span>{formatCurrency(calculation.grand_total_paise)} • Order Now</span>
          </button>
        </div>
      )}

      {/* Customization modal */}
      <CustomizationModal
        item={customiseItem}
        open={!!customiseItem}
        onClose={() => setCustomiseItem(null)}
        onConfirm={(item, variantId, addons, note, qty) => {
          addItem(item, variantId, addons, note, qty);
        }}
      />

      {/* Cart drawer */}
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        booth={booth}
        onOrderCreated={(order) => {
          setDrawerOpen(false);
          if (booth?.accept_order_type === 'PREPAID') {
            setUpiOrderData(order);
          } else {
            setActiveOrder(order);
          }
        }}
      />

      {/* UPI Intent Modal */}
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

      {/* Waiter Call Modal */}
      <WaiterCallModal
        open={waiterModalOpen}
        onClose={() => setWaiterModalOpen(false)}
        booth={booth}
      />
    </div>
  );
};

export default StreetBistroTemplate;
