import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface CartScreenProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
  cafeName?: string;
  tableLocation?: string;
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onProceedToCheckout,
  cafeName,
  tableLocation,
  isOpen = true,
  openingTime,
  isSubmitting = false,
  errorMessage,
  onClearError,
}) => {
  const { items, calculation, updateQuantity, formatCurrency } = useCart();

  const totalAmountPaise = calculation.grand_total_paise;

  return (
    <div className="flex-1 bg-[#FAF9F7] text-stone-900 pb-32 font-sans px-4 sm:px-6 pt-5 flex flex-col justify-between selection:bg-[#C0192A]/20 selection:text-[#C0192A]">
      <div>
        {/* Top Header: Back Button and Title */}
        <div className="flex items-center space-x-3.5 mb-5">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-white border border-stone-200/80 shadow-sm flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="font-black text-2xl text-stone-900 tracking-tight">
            Order Basket
          </h1>
        </div>

        {/* Backend Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 mb-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-red-500 hover:text-red-800 text-xs font-bold underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Closed Store Warning Notice */}
        {!isOpen && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 mb-4 flex items-start gap-3 text-xs sm:text-sm font-medium">
            <span className="text-lg">⛔</span>
            <div>
              <p className="font-black text-amber-950">Restaurant is Currently Closed</p>
              <p className="text-amber-800/90 text-[11px] sm:text-xs mt-0.5">
                We are not currently accepting orders. {openingTime ? `Ordering will resume at ${openingTime}.` : 'Please check back during operating hours.'}
              </p>
            </div>
          </div>
        )}

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
            <div className="w-20 h-20 rounded-full bg-red-50 text-[#C0192A] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[2]" />
            </div>
            <p className="font-black text-xl text-stone-900">Your Basket is Empty</p>
            <p className="text-sm text-stone-400 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
              Explore our freshly prepared gourmet menu and add delicious items to get started!
            </p>
            <button
              onClick={onBack}
              className="mt-6 bg-[#C0192A] hover:bg-[#A31423] text-white text-sm font-extrabold px-7 py-3 rounded-2xl shadow-md shadow-red-600/25 hover:scale-105 active:scale-95 transition cursor-pointer"
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
                {/* Left Thumbnail - Strictly Fixed Sizing (80px by 80px) */}
                <div className="w-20 h-20 min-w-[5rem] min-h-[5rem] max-w-[5rem] max-h-[5rem] rounded-2xl overflow-hidden shrink-0 bg-[#FAF4EE] flex items-center justify-center p-1 border border-stone-200/60 relative">
                  <img
                    src={item.image_url || getFoodImageFallback(item.name)}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                    }}
                    className="w-full h-full max-w-full max-h-full object-cover rounded-xl block shrink-0"
                  />
                </div>

                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 leading-tight truncate">
                    {item.name}
                  </h3>
                  {item.variant_name && (
                    <p className="text-xs text-stone-500 font-bold mt-0.5">
                      Portion: <span className="text-[#FF385C]">{item.variant_name}</span>
                    </p>
                  )}
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <p className="text-[11px] text-stone-400 font-medium truncate mt-0.5">
                      + {item.selected_addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <p className="font-black text-sm sm:text-base text-[#FF385C] mt-1">
                    {formatCurrency(item.unit_price_paise)}
                  </p>

                  {/* Stepper */}
                  <div className="inline-flex items-center space-x-3 bg-stone-50 rounded-full px-3 py-1 mt-2 border border-stone-200/80">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5 cursor-pointer"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="font-black text-sm text-stone-900 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5 cursor-pointer"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => updateQuantity(item.cart_item_id, 0)}
                  className="w-9 h-9 rounded-full bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-500 border border-stone-200/60 flex items-center justify-center active:scale-90 transition shrink-0 cursor-pointer"
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
            {calculation.tax_paise > 0 && (
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Taxes & GST ({calculation.tax_rate_percent}%)</span>
                <span className="font-bold text-stone-800">
                  {formatCurrency(calculation.tax_paise)}
                </span>
              </div>
            )}
            {calculation.service_charge_paise > 0 && (
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Service Charge</span>
                <span className="font-bold text-stone-800">
                  {formatCurrency(calculation.service_charge_paise)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-100">
              <span className="font-black text-lg">Grand Total</span>
              <span className="font-black text-xl text-[#C0192A]">
                {formatCurrency(totalAmountPaise)}
              </span>
            </div>
          </div>

          {/* Action Button: Shop Closed / Submitting / Active */}
          {!isOpen ? (
            <button
              disabled
              className="w-full py-4 px-6 bg-stone-300 text-stone-500 font-extrabold text-base rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 shadow-none select-none"
            >
              <span>The Shop is Closed Now</span>
              {openingTime && (
                <span className="text-xs opacity-75 font-normal">
                  (Opens at {openingTime})
                </span>
              )}
            </button>
          ) : isSubmitting ? (
            <button
              disabled
              className="w-full py-4 px-6 bg-[#C0192A]/80 text-white font-extrabold text-base rounded-2xl cursor-wait flex items-center justify-center gap-2.5 shadow-md shadow-red-600/20"
            >
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Placing Order with Kitchen...</span>
            </button>
          ) : (
            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 px-6 bg-[#C0192A] hover:bg-[#A31423] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-red-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span>•</span>
              <span>{formatCurrency(totalAmountPaise)}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CartScreen;
