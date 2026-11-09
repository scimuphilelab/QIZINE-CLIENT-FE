import React from 'react';
import { Check, ArrowRight, Utensils, Clock, Store } from 'lucide-react';
import type { CreateOrderResponseData } from '../../../core/api/axios';
import { useCart } from '../../../core/hooks/useCart';

export interface OrderConfirmationScreenProps {
  orderData: CreateOrderResponseData | null;
  onViewOrderDetails: () => void;
  onBackToHome: () => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  orderData,
  onViewOrderDetails,
  onBackToHome,
}) => {
  const { formatCurrency } = useCart();

  // Reference Token and Order ID directly from MongoDB backend response
  const refToken = orderData?.ref_token ? `#${orderData.ref_token}` : null;
  const orderNo = orderData?.order_no ? `#${orderData.order_no}` : null;

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900 pb-16 font-sans px-4 sm:px-6 pt-8 flex flex-col justify-between selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      <div>
        {/* Animated Checkmark Badge */}
        <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 mb-4 animate-in zoom-in duration-300">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Order Sent to Kitchen!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-[280px]">
            Your table order has been received by our chefs and is being prepared.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-3.5 mb-6">
          {/* Token row */}
          {refToken && (
            <div className="flex justify-between items-center text-xs pb-3 border-b border-stone-100">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                Order Token
              </span>
              <span className="font-black text-stone-900 font-mono text-base bg-[#FFF4EE] text-[#FF5722] px-3 py-1 rounded-xl border border-[#FFD7C5]">
                {refToken}
              </span>
            </div>
          )}

          {orderNo && (
            <div className="flex justify-between text-xs">
              <span className="text-stone-400 font-medium">Order Number</span>
              <span className="font-extrabold text-stone-800 font-mono">{orderNo}</span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-stone-400 font-medium">Table Location</span>
            <span className="font-bold text-stone-800">
              {orderData?.booth_label ? `Table ${orderData.booth_label}` : 'Dine-In Order'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400 font-medium">Kitchen Status</span>
            <span className="font-black text-stone-800 uppercase tracking-wide text-[11px]">
              {orderData?.status || 'INITIATED'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400 font-medium">Payment Status</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              {orderData?.payment_status || 'PENDING'}
            </span>
          </div>

          {orderData?.total_paise ? (
            <div className="flex justify-between text-xs pt-2 border-t border-stone-100">
              <span className="text-stone-400 font-medium">Total Amount</span>
              <span className="font-black text-stone-900 text-sm">
                {formatCurrency(orderData.total_paise)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onViewOrderDetails}
          type="button"
          className="w-full py-4 px-6 bg-[#FF5722] hover:bg-[#F4511E] text-white font-heading font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Track Kitchen Live</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={onBackToHome}
          type="button"
          className="w-full py-3.5 px-6 bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-800 font-heading font-bold text-xs rounded-2xl shadow-2xs active:scale-95 transition text-center cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;
