import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  AlertCircle,
  ArrowLeft,
  XCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import type { CreateOrderResponseData } from '../api/axios';
import { QizineApi } from '../api/axios';
import { useOrderStatus } from '../hooks/useOrderStatus';
import { useWebPush } from '../hooks/useWebPush';
import { useCart } from '../hooks/useCart';

export interface OrderTrackerViewProps {
  orderData: CreateOrderResponseData;
  onBackToMenu: () => void;
  onOrderCancelled?: () => void;
}

const STEPS = [
  { key: 'INITIATED', label: 'Placed', icon: Clock },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { key: 'READY', label: 'Ready', icon: Sparkles },
  { key: 'SERVED', label: 'Served', icon: ShoppingBag },
] as const;

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  orderData,
  onBackToMenu,
  onOrderCancelled,
}) => {
  const { formatCurrency } = useCart();
  const { currentStatus } = useOrderStatus({
    orderId: orderData.order_id,
    initialOrder: {
      order_id: orderData.order_id,
      ref_token: orderData.ref_token,
      vendor_id: '',
      booth_id: '',
      booth_label: orderData.booth_label,
      status: orderData.status,
      payment_status: orderData.payment_status,
      total_amount_paise: orderData.total_paise,
      created_at: new Date().toISOString(),
    },
  });

  const { isSupported, permission, requestPermissionAndSubscribe } = useWebPush();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Trigger confetti when order moves to READY or when mounted
  useEffect(() => {
    if (currentStatus === 'READY') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [currentStatus]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await QizineApi.cancelOrder(orderData.order_id, orderData.ref_token);
      localStorage.removeItem('qizine_active_order');
      if (onOrderCancelled) onOrderCancelled();
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleEnablePush = async () => {
    await requestPermissionAndSubscribe();
  };

  // Determine current step index
  const statusOrder = ['INITIATED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'];
  const currentStepIndex = Math.max(0, statusOrder.indexOf(currentStatus));

  return (
    <div className="min-h-screen bg-[#FAF4EE] text-stone-900 pb-20 font-sans selection:bg-[#FF385C]/20 selection:text-[#FF385C]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-[#FAF4EE]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="w-11 h-11 rounded-full bg-white border border-stone-200/80 shadow-sm flex items-center justify-center text-stone-800 hover:scale-105 active:scale-95 transition"
          aria-label="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="font-black text-lg sm:text-xl text-stone-900 tracking-tight">
          Live Order Status
        </span>
        <div className="w-11 h-11" />
      </header>

      <main className="max-w-md sm:max-w-lg mx-auto p-4 sm:p-5 space-y-4">
        {/* Token Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF512F] via-[#FF385C] to-[#DD2476]" />
          
          <p className="text-xs uppercase tracking-widest font-bold text-stone-400">
            Pickup & Table Token
          </p>

          <div className="my-3 inline-block bg-red-50 border border-red-200/60 rounded-2xl px-6 py-2.5 shadow-2xs">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-[#FF385C]">
              #{orderData.ref_token}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-stone-800">
            Order #{orderData.order_no} • {orderData.booth_label}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Total Paid: <span className="font-black text-stone-900">{formatCurrency(orderData.total_paise)}</span>
          </p>
        </div>

        {/* Live Stepper Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-stone-900 tracking-tight">
              Kitchen Preparation Status
            </h3>
            <span className="text-xs font-black text-[#FF385C] bg-red-50 border border-red-200/60 px-3 py-1 rounded-full uppercase">
              {currentStatus}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-2 pb-1">
            <div className="flex justify-between items-center relative z-10">
              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-[#FF385C] text-white shadow-lg shadow-red-500/25 scale-110 ring-4 ring-red-500/20'
                          : isPassed
                          ? 'bg-red-50 text-[#FF385C] border border-red-200/60'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                        isPassed ? 'text-[#FF385C]' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Estimate Message */}
          <div className="bg-[#FEE8DC] rounded-2xl p-3.5 flex items-center space-x-3 text-xs sm:text-sm text-stone-800 font-medium border border-[#FCD8C4]/80">
            <Clock className="w-5 h-5 text-[#FF385C] shrink-0 stroke-[2.2]" />
            <p>
              {currentStatus === 'INITIATED' && 'Order received. Waiting for kitchen confirmation.'}
              {currentStatus === 'ACCEPTED' && 'Kitchen accepted your order. Preparation starting.'}
              {currentStatus === 'PREPARING' && 'Chef is currently cooking your fresh items (~15 mins).'}
              {currentStatus === 'READY' && '🎉 Your order is ready! Please quote your token at the counter.'}
              {currentStatus === 'SERVED' && 'Enjoy your meal! Order marked served.'}
            </p>
          </div>
        </div>

        {/* View 7: Web Push Notification Alert Prompt */}
        {isSupported && permission !== 'granted' && (
          <div className="bg-white rounded-3xl p-4 border border-stone-200/70 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#FF385C] flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">Get Buzz When Ready</h4>
                <p className="text-[11px] text-stone-400 truncate">We will send a phone alert when food is cooked</p>
              </div>
            </div>
            <button
              onClick={handleEnablePush}
              className="px-4 py-2 bg-[#FF385C] hover:bg-[#E0294C] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition shrink-0"
            >
              Notify Me
            </button>
          </div>
        )}

        {/* Cancel Action (Only active when status == INITIATED) */}
        {currentStatus === 'INITIATED' && (
          <div className="text-center pt-2">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition"
            >
              <XCircle className="w-4 h-4 stroke-[2.2]" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order (Self-Service)'}</span>
            </button>
            {cancelError && <p className="text-xs text-red-500 mt-1 font-medium">{cancelError}</p>}
          </div>
        )}

        {/* Back to Menu CTA */}
        <div className="pt-2">
          <button
            onClick={onBackToMenu}
            className="w-full py-4 px-6 bg-[#FF385C] hover:bg-[#E0294C] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-500/25 active:scale-95 transition text-center flex items-center justify-center gap-2"
          >
            <span>+ Add More Items from Menu</span>
          </button>
        </div>
      </main>
    </div>
  );
};
