import React, { useState } from 'react';
import { Drawer } from 'antd';
import { ShoppingBag, ArrowRight, Trash2, HeartHandshake, Leaf, Phone, User } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { QizineApi, type CreateOrderResponseData } from '../api/axios';
import type { QRBoothContext } from '../types/order.types';

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  booth?: QRBoothContext;
  qrKey?: string;
  onOrderCreated: (order: CreateOrderResponseData) => void;
}

const TIP_OPTIONS = [0, 10, 20, 50];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  booth,
  qrKey = 'qr_default',
  onOrderCreated,
}) => {
  const { items, calculation, updateQuantity, clearCart, formatCurrency } = useCart();

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [noCutlery, setNoCutlery] = useState<boolean>(true);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute grand total with optional tip
  const tipPaise = selectedTip * 100;
  const grandTotalWithTipPaise = calculation.grand_total_paise + tipPaise;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const payload = {
        qr_key: qrKey,
        idempotency_key: idempotencyKey,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        customer_note: [
          orderNote.trim(),
          noCutlery ? 'No plastic cutlery requested.' : '',
          selectedTip > 0 ? `Tip: ₹${selectedTip}` : '',
        ]
          .filter(Boolean)
          .join(' | ') || undefined,
        payment_method: (booth?.accept_order_type === 'POSTPAID' ? 'CASH' : 'UPI') as 'UPI' | 'CASH',
        items: items.map((item) => ({
          item_id: item.item_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          customizations: item.selected_addons.map((a) => ({
            group_id: a.group_id,
            option_id: a.id,
          })),
        })),
      };

      const orderResult = await QizineApi.createOrder(payload, idempotencyKey);
      
      // Save active order locally to support page reload restoration
      localStorage.setItem('qizine_active_order', JSON.stringify(orderResult));
      clearCart();
      onClose();
      onOrderCreated(orderResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-heading font-bold text-base leading-tight">Your Order Cart</h3>
              {booth && (
                <p className="text-[11px] text-muted">
                  {booth.booth_label} • {booth.vendor_name}
                </p>
              )}
            </div>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      }
      placement="bottom"
      height="88%"
      onClose={onClose}
      open={open}
      className="rounded-t-3xl overflow-hidden [&_.ant-drawer-header]:border-black/5"
    >
      <div className="flex flex-col h-full justify-between pb-4 max-w-xl mx-auto">
        {/* Scrollable Cart Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-gray-300 mb-2" />
              <p className="text-xs font-semibold">Your cart is empty.</p>
              <p className="text-[11px] mt-0.5">Add dishes from the menu to build your meal.</p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="p-3 bg-surface-alt rounded-2xl border border-black/5 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug">
                        {item.name}
                      </h4>
                      {item.variant_name && (
                        <p className="text-[11px] text-muted font-medium">
                          Size: {item.variant_name}
                        </p>
                      )}
                      {item.selected_addons.length > 0 && (
                        <p className="text-[10px] text-primary/80 mt-0.5">
                          + {item.selected_addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                      {item.special_instructions && (
                        <p className="text-[10px] text-gray-500 italic mt-0.5">
                          "{item.special_instructions}"
                        </p>
                      )}
                      <p className="text-xs font-bold text-primary mt-1">
                        {formatCurrency(item.total_price_paise)}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center space-x-2 bg-surface border border-black/10 rounded-xl px-2 py-1 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="text-xs font-bold px-1 text-gray-600 hover:text-red-500"
                        aria-label="Decrease"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="text-xs font-bold px-1 text-gray-600 hover:text-green-600"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cooking Instructions & Eco-Toggle */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noCutlery}
                    onChange={(e) => setNoCutlery(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <div className="flex items-center space-x-1">
                    <Leaf className="w-3.5 h-3.5 text-green-600" />
                    <span>Don't send plastic cutlery (Eco-friendly)</span>
                  </div>
                </label>

                <input
                  type="text"
                  placeholder="Special instructions for kitchen / runner..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition"
                  maxLength={100}
                />
              </div>

              {/* Customer Contact Info (Zero-Auth Lightweight) */}
              <div className="p-3 bg-surface rounded-2xl border border-black/5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Customer Information (For Digital Receipt)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone (10 digits)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-8 pr-2 py-2 text-xs rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Tip Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span className="flex items-center space-x-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold">Tip Kitchen Staff</span>
                  </span>
                  {selectedTip > 0 && <span className="font-bold text-primary">+₹{selectedTip}</span>}
                </div>
                <div className="flex space-x-2">
                  {TIP_OPTIONS.map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setSelectedTip(tip)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selectedTip === tip
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-black/10 bg-surface text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tip === 0 ? 'None' : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Breakdown Card */}
              <div className="p-3 bg-surface-alt rounded-2xl border border-black/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Item Subtotal</span>
                  <span>{formatCurrency(calculation.subtotal_paise)}</span>
                </div>
                {calculation.tax_paise > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>
                      Taxes (CGST + SGST {calculation.tax_rate_percent}%)
                    </span>
                    <span>{formatCurrency(calculation.tax_paise)}</span>
                  </div>
                )}
                {calculation.service_charge_paise > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Service Charge ({calculation.service_charge_percent}%)</span>
                    <span>{formatCurrency(calculation.service_charge_paise)}</span>
                  </div>
                )}
                {selectedTip > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Staff Tip</span>
                    <span>₹{selectedTip}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-dashed border-black/10">
                  <span>To Pay</span>
                  <span className="text-primary">{formatCurrency(grandTotalWithTipPaise)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Button */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-black/5">
            {error && <p className="text-xs text-red-500 font-semibold mb-2 text-center">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-4 px-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-2xl shadow-floating flex items-center justify-between hover:opacity-95 transition disabled:opacity-50"
            >
              <span>
                {submitting
                  ? 'Placing Order...'
                  : booth?.accept_order_type === 'POSTPAID'
                  ? 'Confirm Order (Pay After Eating)'
                  : `Proceed to Pay ${formatCurrency(grandTotalWithTipPaise)}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
};
