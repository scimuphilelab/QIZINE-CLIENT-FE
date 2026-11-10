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
          /* PREPAID: Waiting for Manager Payment Verification */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-6">
            <div className="relative w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 mb-4 animate-in zoom-in duration-300">
              <Clock className="w-10 h-10 stroke-[2.5] animate-pulse" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px]">
                ₹
              </span>
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 mb-2">
              Payment Under Verification
            </span>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Order Initiated!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-[300px]">
              The restaurant manager is verifying your UPI payment. Once confirmed, your order will move directly to the kitchen.
            </p>
          </div>
        ) : isConfirmed ? (
          /* CONFIRMED: Order Accepted by Kitchen */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 mb-2">
              Order Confirmed
            </span>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Cooking in Progress!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-[280px]">
              Our chefs have received your order and started preparing your dishes freshly.
            </p>
          </div>
        ) : (
          /* POSTPAID or General: Order Placed */
          <div className="flex flex-col items-center justify-center text-center mt-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#FFF4EE] text-[#FF5722] border border-[#FFD7C5] mb-2">
              Postpaid • Pay on Bill
            </span>

            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Order Sent to Kitchen!
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-[300px]">
              Your table order has been dispatched. A printed thermal bill with a dynamic UPI payment QR will be brought to your table.
            </p>
          </div>
        )}

        {/* Informative Guidance Banner */}
        {isPrepaid && isInitiated ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Manager Approval in Progress</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                We are listening for confirmation from the counter. This page will update automatically once accepted.
              </p>
              {onReopenPayment && (
                <button
                  onClick={onReopenPayment}
                  type="button"
                  className="mt-2 text-[11px] font-black text-[#FF5722] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Re-open UPI Payment QR</span>
                </button>
              )}
            </div>
          </div>
        ) : !isPrepaid ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-5 flex items-start gap-3 text-xs text-blue-900">
            <Receipt className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">No Upfront Payment Required</p>
              <p className="text-[11px] text-blue-800/90 mt-0.5">
                Enjoy your freshly prepared food! The server will hand you your itemized bill with an instant UPI QR code at your table.
              </p>
            </div>
          </div>
        ) : null}

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
