import React from 'react';
import {
  Check,
  ArrowRight,
  Clock,
  ShieldCheck,
  QrCode,
  Store,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import type { CreateOrderResponseData } from '../../../core/api/axios';
import { useCart } from '../../../core/hooks/useCart';
import { useOrderStatus } from '../../../core/hooks/useOrderStatus';

export interface OrderConfirmationScreenProps {
  orderData: CreateOrderResponseData | null;
  onViewOrderDetails: () => void;
  onBackToHome: () => void;
  onReopenPayment?: () => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  orderData,
  onViewOrderDetails,
  onBackToHome,
  onReopenPayment,
}) => {
  const { formatCurrency } = useCart();

  // Real-time synchronization: automatically updates when manager accepts or confirms payment
  const { currentStatus, paymentStatus } = useOrderStatus({
    orderId: orderData?.order_id,
    pollIntervalMs: 3500,
    initialOrder: orderData
      ? {
          order_id: orderData.order_id,
          ref_token: orderData.ref_token,
          vendor_id: '',
          booth_id: '',
          booth_label: orderData.booth_label,
          status: orderData.status,
          payment_status: orderData.payment_status,
          total_amount_paise: orderData.total_paise,
          created_at: new Date().toISOString(),
        }
      : null,
  });

  const refToken = orderData?.ref_token ? `#${orderData.ref_token}` : null;
  const orderNo = orderData?.order_no ? `#${orderData.order_no}` : null;
  const isPrepaid = orderData?.accept_order_type === 'PREPAID';
  const isInitiated = currentStatus === 'INITIATED';
  const isConfirmed = currentStatus === 'ACCEPTED' || currentStatus === 'PREPARING';

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900 pb-16 font-sans px-4 sm:px-6 pt-6 flex flex-col justify-between selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
      <div>
        {/* Dynamic Header State */}
        {isPrepaid && isInitiated ? (
          /* PREPAID: Waiting for Payment Verification */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-5">
            <div className="relative w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 animate-in zoom-in duration-300">
              <Clock className="w-8 h-8 stroke-[2.5] animate-pulse" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 mb-2">
              Payment Under Verification
            </span>

            <h1 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
              Order Placed!
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-[280px]">
              Waiting for payment confirmation from staff.
            </p>

            {onReopenPayment && (
              <button
                onClick={onReopenPayment}
                type="button"
                className="mt-3 text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1.5 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Re-open Payment QR</span>
              </button>
            )}
          </div>
        ) : isConfirmed ? (
          /* CONFIRMED: Order Accepted by Kitchen */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 animate-in zoom-in duration-300">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 mb-2">
              Confirmed
            </span>

            <h1 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
              Preparing Your Food!
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-[280px]">
              The kitchen is preparing your dishes.
            </p>
          </div>
        ) : (
          /* POSTPAID: Order Placed */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 animate-in zoom-in duration-300">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#FFF4EE] text-[#FF5722] border border-[#FFD7C5] mb-2">
              Pay at Table
            </span>

            <h1 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
              Order Sent to Kitchen!
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-[280px]">
              Enjoy your food! You can pay at your table after dining.
            </p>
          </div>
        )}

        {/* Order Details Receipt Box */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-2xs space-y-3 mb-6">
          {refToken && (
            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-stone-100">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                Order Token
              </span>
              <span className="font-black font-mono text-base bg-[#FFF4EE] text-[#FF5722] px-3 py-1 rounded-xl border border-[#FFD7C5]">
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
            <span className="text-stone-400 font-medium">Order Type</span>
            <span className="font-bold text-stone-800">
              {isPrepaid ? 'Prepaid (UPI)' : 'Postpaid (Pay at Table)'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400 font-medium">Kitchen Status</span>
            <span
              className={`font-black uppercase tracking-wide text-[11px] px-2 py-0.5 rounded-md ${
                isConfirmed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentStatus}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-stone-400 font-medium">Payment Status</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                paymentStatus === 'PAID' || paymentStatus === 'SUCCESS'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {paymentStatus}
            </span>
          </div>

          {orderData?.total_paise ? (
            <div className="flex justify-between text-xs pt-2.5 border-t border-stone-100">
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
          <span>Track Live Order Status</span>
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
