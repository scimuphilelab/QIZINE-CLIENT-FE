import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';

export interface CartScreenProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onProceedToCheckout,
}) => {
  const { items, calculation, updateQuantity, formatCurrency } = useCart();

  const deliveryFeePaise = 3000; // ₹ 30
  const totalAmountPaise = calculation.subtotal_paise + deliveryFeePaise;

  return (
    <div className="min-h-screen bg-[#F7EFE3] text-[#1C1917] pb-28 font-sans px-5 pt-3 max-w-md mx-auto flex flex-col justify-between">
      <div>
        {/* iOS Top Status Placeholder */}
        <div className="flex justify-between items-center text-[11px] font-semibold text-[#1C1917] px-1 mb-2 opacity-90">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* Top Header: < Your Cart with 3D Back Button */}
        <div className="flex items-center space-x-2.5 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#FAF4EC] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center text-[#1C1917] hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <h1 className="font-serif font-black text-xl text-[#1C1917] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            Your Cart
          </h1>
        </div>

        {/* Cart Item Cards with 3D Depth */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-[#7E756B]">
            <p className="font-serif font-bold text-base text-[#1C1917]">Your Cart is Empty</p>
            <p className="text-xs mt-1">Discover mouth-watering burgers & sides to order.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item.cart_item_id}
                className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_10px_22px_-4px_rgba(28,25,23,0.1),0_3px_8px_-2px_rgba(28,25,23,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 transition"
              >
                {/* Left Thumbnail with shadow */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#EFE5D8] shadow-[0_3px_8px_rgba(0,0,0,0.08)]">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Middle Info */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-serif font-bold text-xs text-[#1C1917] leading-tight truncate">
                    {item.name}
                  </h3>
                  <p className="font-serif font-bold text-xs text-[#1C1917] mt-1">
                    {formatCurrency(item.unit_price_paise)}
                  </p>

                  {/* 3D Inset Stepper */}
                  <div className="inline-flex items-center space-x-2 bg-[#EFE5D8] rounded-lg px-2.5 py-1 mt-1.5 border border-[#E2D5C3] shadow-[inset_0_2px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(255,255,255,0.8)]">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="font-bold text-xs text-[#1C1917] w-3 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="text-[#1C1917] hover:opacity-70 active:scale-90 p-0.5"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Right Delete Button with 3D press */}
                <button
                  onClick={() => updateQuantity(item.cart_item_id, 0)}
                  className="w-7 h-7 rounded-full bg-[#EFE5D8]/80 hover:bg-red-50 text-[#8E8276] hover:text-red-500 border border-[#E2D5C3] flex items-center justify-center shadow-2xs active:scale-90 transition"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary & Proceed to Checkout */}
      {items.length > 0 && (
        <div className="space-y-4 pt-3">
          {/* 3D Elevated Bill Summary Card */}
          <div className="bg-[#FAF4EC] rounded-2xl p-4 border border-[#E8DDCF] shadow-[0_8px_20px_-4px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-2 text-xs">
            <div className="flex justify-between text-[#7E756B]">
              <span>Subtotal</span>
              <span className="font-medium text-[#1C1917]">
                {formatCurrency(calculation.subtotal_paise)}
              </span>
            </div>
            <div className="flex justify-between text-[#7E756B]">
              <span>Delivery Fee</span>
              <span className="font-medium text-[#1C1917]">{formatCurrency(deliveryFeePaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1C1917] pt-2 border-t border-[#E8DDCF]">
              <span className="font-serif font-black text-base">Total</span>
              <span className="font-serif font-black text-base">
                {formatCurrency(totalAmountPaise)}
              </span>
            </div>
          </div>

          {/* 3D Black Action Button */}
          <button
            onClick={onProceedToCheckout}
            className="w-full py-4 px-5 bg-[#1C1917] text-[#F7EFE3] font-bold text-xs rounded-2xl shadow-[0_10px_24px_-4px_rgba(28,25,23,0.4),0_4px_8px_-2px_rgba(28,25,23,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.5)] active:scale-98 transition flex items-center justify-center"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};
