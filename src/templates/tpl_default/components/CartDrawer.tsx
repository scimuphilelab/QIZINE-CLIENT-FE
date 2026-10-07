import React from 'react';
import { Drawer } from 'antd';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';
import { useCheckout } from '../../../core/hooks/useCheckout';
import type { QRBoothContext } from '../../../core/types/order.types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  booth?: QRBoothContext;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose, booth }) => {
  const { items, calculation, updateQuantity, formatCurrency } = useCart();
  const { dispatchOrder, submitting, error } = useCheckout();

  const handleCheckout = async () => {
    if (!booth) {
      alert('Scanning session required for checkout');
      return;
    }
    try {
      await dispatchOrder(booth);
      onClose();
    } catch {
      // Error handled by hook state
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-base">Your Order</span>
        </div>
      }
      placement="bottom"
      height="80%"
      onClose={onClose}
      open={open}
      className="rounded-t-3xl overflow-hidden"
    >
      <div className="flex flex-col h-full justify-between pb-6">
        {/* Item List */}
        <div className="space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className="flex items-center justify-between p-3 bg-surface-alt rounded-xl border border-black/5"
            >
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                {item.variant_name && (
                  <p className="text-xs text-muted">{item.variant_name}</p>
                )}
                <p className="text-xs font-bold text-primary mt-0.5">
                  {formatCurrency(item.unit_price_paise)}
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center space-x-2 bg-surface border border-black/10 rounded-lg px-2 py-1">
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                  className="text-xs font-bold px-1 text-gray-600 hover:text-red-500"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                  className="text-xs font-bold px-1 text-gray-600 hover:text-green-600"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary & Pay Button */}
        <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
          <div className="flex justify-between text-xs text-muted">
            <span>Item Subtotal</span>
            <span>{formatCurrency(calculation.subtotal_paise)}</span>
          </div>
          {calculation.tax_paise > 0 && (
            <div className="flex justify-between text-xs text-muted">
              <span>Taxes & Charges ({calculation.tax_rate_percent}%)</span>
              <span>{formatCurrency(calculation.tax_paise)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-dashed border-black/10">
            <span>Grand Total</span>
            <span className="text-primary">{formatCurrency(calculation.grand_total_paise)}</span>
          </div>

          {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={submitting || items.length === 0}
            className="w-full mt-3 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-soft flex items-center justify-center space-x-2 hover:opacity-95 transition disabled:opacity-50"
          >
            <span>{submitting ? 'Placing Order...' : 'Proceed to Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Drawer>
  );
};
