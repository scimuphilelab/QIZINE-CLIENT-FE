import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface CartScreenProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
  cafeName?: string;
  tableLocation?: string;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onProceedToCheckout,
  cafeName,
  tableLocation,
}) => {
  const { items, calculation, updateQuantity, formatCurrency } = useCart();

  const deliveryFeePaise = 3000; // ₹30 delivery / service charge
  const totalAmountPaise = calculation.subtotal_paise + deliveryFeePaise;

  return (
    <div className="flex-1 bg-[#FAF4EE] text-stone-900 pb-32 font-sans px-4 sm:px-6 pt-5 flex flex-col justify-between selection:bg-[#FF385C]/20 selection:text-[#FF385C]">
      <div>
        {/* Top Header: Back Button and Title */}
        <div className="flex items-center space-x-3.5 mb-5">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-white border border-stone-200/80 shadow-sm flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="font-black text-2xl text-stone-900 tracking-tight">
            Order Basket
          </h1>
        </div>

        {/* Vendor and Table Context Pill */}
        {cafeName && (
          <div className="bg-white rounded-2xl p-3 mb-5 border border-stone-200/70 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">🏪</span>
              <div className="min-w-0">
                <p className="text-xs font-black text-stone-900 truncate">{cafeName}</p>
                {tableLocation && (
                  <p className="text-[11px] text-stone-500 font-medium truncate">
                    📍 {tableLocation}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
              Dine-In
            </span>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl p-8 border border-stone-200/70 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-red-50 text-[#FF385C] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[2]" />
            </div>
            <p className="font-black text-xl text-stone-900">Your Basket is Empty</p>
            <p className="text-sm text-stone-400 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
              Explore our freshly prepared gourmet menu and add delicious items to get started!
            </p>
            <button
              onClick={onBack}
              className="mt-6 bg-[#FF385C] text-white text-sm font-extrabold px-7 py-3 rounded-2xl shadow-md shadow-red-500/25 hover:scale-105 active:scale-95 transition"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 mb-6">
            {items.map((item) => (
              <div
                key={item.cart_item_id}
                className="bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/60 shadow-sm flex items-center justify-between gap-3.5 transition-all"
              >
                {/* Left Thumbnail */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#FAF4EE] flex items-center justify-center p-1.5 border border-stone-100">
                  <img
                    src={item.image_url || getFoodImageFallback(item.name)}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                    }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 leading-tight truncate">
                    {item.name}
                  </h3>
                  <p className="font-black text-sm sm:text-base text-[#FF385C] mt-1">
                    {formatCurrency(item.unit_price_paise)}
                  </p>

                  {/* Stepper */}
                  <div className="inline-flex items-center space-x-3 bg-stone-50 rounded-full px-3 py-1 mt-2 border border-stone-200/80">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="font-black text-sm text-stone-900 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => updateQuantity(item.cart_item_id, 0)}
                  className="w-9 h-9 rounded-full bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-500 border border-stone-200/60 flex items-center justify-center active:scale-90 transition shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary & Proceed to Checkout */}
      {items.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Bill Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3 text-sm">
            <div className="flex justify-between text-stone-500 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-stone-800">
                {formatCurrency(calculation.subtotal_paise)}
              </span>
            </div>
            <div className="flex justify-between text-stone-500 font-medium">
              <span>Delivery & Service</span>
              <span className="font-bold text-stone-800">
                {formatCurrency(deliveryFeePaise)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-100">
              <span className="font-black text-lg">Grand Total</span>
              <span className="font-black text-xl text-[#FF385C]">
                {formatCurrency(totalAmountPaise)}
              </span>
            </div>
          </div>

          {/* Coral Red Action Button */}
          <button
            onClick={onProceedToCheckout}
            className="w-full py-4 px-6 bg-[#FF385C] hover:bg-[#E0294C] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-red-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <span>•</span>
            <span>{formatCurrency(totalAmountPaise)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
