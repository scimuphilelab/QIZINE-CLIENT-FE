import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Store, MapPin, AlertCircle } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';
import { DishThumbnail } from '../components/DishThumbnail';
import { cleanUserMessage } from '../../../core/utils/userMessage';

export interface CartScreenProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
  cafeName?: string;
  tableLocation?: string;
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  acceptOrderType?: 'PREPAID' | 'POSTPAID';
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
  acceptOrderType = 'PREPAID',
  isSubmitting = false,
  errorMessage,
  onClearError,
}) => {
  const { items, calculation, updateQuantity, formatCurrency } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900 pb-32 font-sans px-4 sm:px-6 pt-4 flex flex-col justify-between selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      <div>
        {/* Top Header: Back Button and Title */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              type="button"
              className="w-10 h-10 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition cursor-pointer"
              aria-label="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight">
              Order Basket
            </h1>
          </div>

          <span className="font-heading text-xs font-bold text-stone-500 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-2xs">
            {calculation.total_items_count} {calculation.total_items_count === 1 ? 'item' : 'items'}
          </span>
        </header>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 mb-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{cleanUserMessage(errorMessage, 'Unable to place order. Please try again.')}</span>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                type="button"
                className="text-red-500 hover:text-red-800 text-xs font-bold underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Closed Store Warning Notice */}
        {!isOpen && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 mb-4 flex items-center gap-2.5 text-xs font-medium">
            <span className="text-base">⛔</span>
            <div>
              <p className="font-bold text-amber-950">Restaurant is currently closed</p>
              <p className="text-amber-800/90 text-[11px] mt-0.5">
                {openingTime
                  ? `Ordering resumes at ${openingTime}.`
                  : 'Please check back during open hours.'}
              </p>
            </div>
          </div>
        )}

        {/* Vendor and Table Context Pill */}
        {cafeName && (
          <div className="bg-white rounded-2xl p-3 mb-4 border border-stone-200/70 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FFF4EE] text-[#FF5722] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-stone-900 truncate">{cafeName}</p>
                {tableLocation && (
                  <p className="text-[11px] text-stone-500 font-medium truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF5722]" />
                    <span>{tableLocation}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-stone-200/70 shadow-xs my-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="font-extrabold text-lg text-stone-900">Your Basket is Empty</h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Explore our freshly prepared menu and add delicious dishes to get started!
            </p>
            <button
              onClick={onBack}
              type="button"
              className="mt-5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/25 active:scale-95 transition cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* List of Items */
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item.cart_item_id}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-stone-200/70 shadow-2xs flex items-center justify-between gap-3 transition-all"
              >
                {/* Left Thumbnail (no fake static photos) */}
                <DishThumbnail
                  url={item.image_url}
                  name={item.name}
                  className="w-16 h-16 sm:w-18 sm:h-18 shrink-0"
                />

                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">
                    {item.name}
                  </h3>
                  {item.variant_name && (
                    <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
                      Portion: <span className="text-[#FF5722]">{item.variant_name}</span>
                    </p>
                  )}
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
                      + {item.selected_addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <p className="font-black text-xs sm:text-sm text-stone-900 mt-1">
                    {formatCurrency(item.unit_price_paise)}
                  </p>

                  {/* Stepper */}
                  <div className="inline-flex items-center space-x-2.5 bg-stone-50 rounded-full px-2.5 py-1 mt-1.5 border border-stone-200">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      type="button"
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="font-black text-xs text-stone-900 min-w-[14px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      type="button"
                      className="text-stone-500 hover:text-stone-900 active:scale-90 p-0.5 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => updateQuantity(item.cart_item_id, 0)}
                  type="button"
                  className="w-8 h-8 rounded-full bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-500 border border-stone-200 flex items-center justify-center active:scale-90 transition shrink-0 cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary & Order Submission */}
      {items.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Bill Summary Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/70 shadow-2xs space-y-2.5 text-xs sm:text-sm">
            <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider mb-2">
              Bill Summary
            </h3>

            <div className="flex justify-between text-stone-500 font-medium">
              <span>Item Subtotal</span>
              <span className="font-bold text-stone-800">
                {formatCurrency(calculation.subtotal_paise)}
              </span>
            </div>

            {calculation.tax_paise > 0 && (
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Taxes & GST</span>
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

            <div className="border-t border-dashed border-stone-200 pt-2.5 flex justify-between items-baseline font-black">
              <span className="font-heading text-stone-900 text-sm sm:text-base">Total Payable</span>
              <span className="font-heading text-[#FF5722] text-lg sm:text-xl">
                {formatCurrency(calculation.grand_total_paise)}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={onProceedToCheckout}
            type="button"
            disabled={isSubmitting || !isOpen}
            className={`w-full py-4 px-6 rounded-2xl font-heading font-black text-sm sm:text-base shadow-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              isSubmitting || !isOpen
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-[#FF5722] hover:bg-[#F4511E] text-white shadow-orange-500/25 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </div>
            ) : acceptOrderType === 'PREPAID' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span>Pay & Place Order • {formatCurrency(calculation.grand_total_paise)}</span>
                </div>
                <span className="text-[11px] font-medium opacity-90 tracking-normal">
                  Instant UPI via GPay / PhonePe / Paytm
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span>Place Table Order • {formatCurrency(calculation.grand_total_paise)}</span>
                </div>
                <span className="text-[11px] font-medium opacity-90 tracking-normal">
                  Postpaid • Bill provided at your table
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
