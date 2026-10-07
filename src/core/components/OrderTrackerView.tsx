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
    <div className="min-h-screen bg-background text-gray-900 pb-16 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-black/5 p-4 flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>
        <span className="font-heading font-bold text-sm text-gray-900">Live Order Tracker</span>
        <div className="w-12" />
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        {/* Token Card */}
        <div className="bg-surface rounded-3xl p-6 border border-black/5 shadow-soft text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
          
          <p className="text-xs uppercase tracking-widest font-bold text-muted">
            Pickup & Verification Token
          </p>

          <div className="my-3 inline-block bg-primary/10 border-2 border-primary/20 rounded-2xl px-6 py-2.5 shadow-inner">
            <span className="font-mono text-3xl font-black tracking-wider text-primary">
              #{orderData.ref_token}
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-800">
            Order #{orderData.order_no} • {orderData.booth_label}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            Total Paid: {formatCurrency(orderData.total_paise)}
          </p>
        </div>

        {/* Live Stepper Card */}
        <div className="bg-surface rounded-3xl p-5 border border-black/5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Kitchen Preparation Status
            </h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-md scale-110 ring-4 ring-primary/20'
                          : isPassed
                          ? 'bg-primary/20 text-primary'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                        isPassed ? 'text-primary' : 'text-gray-400'
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
          <div className="bg-surface-alt rounded-2xl p-3 flex items-center space-x-3 text-xs text-gray-700">
            <Clock className="w-4 h-4 text-primary shrink-0" />
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
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <BellRing className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">Get Buzz When Ready</h4>
                <p className="text-[11px] text-muted">We will send a phone alert when food is cooked</p>
              </div>
            </div>
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs hover:opacity-95 transition"
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
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order (Self-Service)'}</span>
            </button>
            {cancelError && <p className="text-xs text-red-500 mt-1">{cancelError}</p>}
          </div>
        )}

        {/* Back to Menu CTA */}
        <div className="pt-4">
          <button
            onClick={onBackToMenu}
            className="w-full py-3.5 px-4 bg-surface hover:bg-gray-100 border border-black/10 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition"
          >
            + Add More Items from Menu
          </button>
        </div>
      </main>
    </div>
  );
};
