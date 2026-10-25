import React from 'react';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import type { CreateOrderResponseData } from '../../../core/api/axios';

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
  const displayToken = orderData?.ref_token
    ? `#${orderData.ref_token}`
    : orderData?.order_no
    ? `#${orderData.order_no}`
    : 'Pending';
  const paymentMethod = orderData?.payment_status || 'UPI';

  return (
    <div className="flex-1 bg-[#FAF9F7] text-stone-900 pb-16 font-sans px-4 sm:px-5 pt-8 flex flex-col justify-between selection:bg-[#C0192A]/20 selection:text-[#C0192A]">
      <div>
        {/* Animated Checkmark Badge */}
        <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#C0192A] text-white flex items-center justify-center shadow-lg shadow-red-600/30 mb-4 animate-in zoom-in duration-300">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h1 className="font-extrabold text-2xl text-stone-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-[240px]">
            Your kitchen order has been sent. Sit back and relax while our chef prepares your food!
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-100">
            <span className="text-stone-400 font-medium">Order Reference</span>
            <span className="font-extrabold text-stone-900 font-mono tracking-wider text-sm">
              {displayToken}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400">Table / Booth</span>
            <span className="font-bold text-stone-800">
              {orderData?.booth_label ? `Table ${orderData.booth_label}` : 'Direct Order'}
            </span>
          </div>

          {orderData?.serving_model && (
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Service</span>
              <span className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
                {orderData.serving_model.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-stone-400">Status</span>
            <span className="font-bold text-stone-800 uppercase tracking-wide text-[11px]">
              {orderData?.status || 'RECEIVED'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400">Payment Status</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {orderData?.payment_status || 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onViewOrderDetails}
          className="w-full py-4 px-6 bg-[#C0192A] hover:bg-[#A31423] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/25 active:scale-95 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Track Live Order</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          onClick={onBackToHome}
          className="w-full py-3.5 px-6 bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-800 font-bold text-xs rounded-2xl shadow-sm active:scale-95 transition text-center"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;
