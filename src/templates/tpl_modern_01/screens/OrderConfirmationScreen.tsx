import React from 'react';
import { Check } from 'lucide-react';
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
  const displayToken = orderData?.ref_token ? `#${orderData.ref_token}` : '#FB2437';
  const paymentMethod = orderData?.payment_status ? 'UPI' : 'UPI';

  return (
    <div className="min-h-screen bg-[#F7EFE3] text-[#1C1917] pb-16 font-sans px-5 pt-3 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* iOS Top Status Placeholder */}
        <div className="flex justify-between items-center text-[11px] font-semibold text-[#1C1917] px-1 mb-8 opacity-90">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* Center Animated 3D Checkmark with Sunburst Rays */}
        <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
          <div className="relative mb-5">
            {/* Sunburst Ticks */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex space-x-2 text-[#1C1917]">
              <span className="text-xs font-bold -rotate-12">/</span>
              <span className="text-xs font-bold">|</span>
              <span className="text-xs font-bold rotate-12">\</span>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 text-[#1C1917]">
              <span className="text-xs font-bold rotate-12">\</span>
              <span className="text-xs font-bold">|</span>
              <span className="text-xs font-bold -rotate-12">/</span>
            </div>

            {/* 3D Elevated Black Circular Badge */}
            <div className="w-22 h-22 rounded-full bg-[#1C1917] text-[#F7EFE3] flex items-center justify-center shadow-[0_16px_36px_rgba(28,25,23,0.35),0_6px_14px_rgba(28,25,23,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] border-2 border-black/30">
              <Check className="w-11 h-11 stroke-[3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          <h1 className="font-serif font-black text-2xl text-[#1C1917] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            Order Placed!
          </h1>
          <p className="text-xs text-[#7E756B] mt-1.5">
            Your delicious food is on its way.
          </p>
        </div>

        {/* 3D Elevated Order Details Receipt Box */}
        <div className="bg-[#FAF4EC] rounded-2xl p-4 border border-[#E8DDCF] shadow-[0_10px_25px_-5px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-3 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-[#7E756B]">Order ID</span>
            <span className="font-bold text-[#1C1917] font-mono tracking-wider">{displayToken}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#7E756B]">Estimated Delivery</span>
            <span className="font-semibold text-[#1C1917]">25-30 mins</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#7E756B]">Payment Method</span>
            <span className="font-semibold text-[#1C1917]">{paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* 3D Action Buttons */}
      <div className="space-y-3 relative z-10">
        <button
          onClick={onViewOrderDetails}
          className="w-full py-4 px-5 bg-[#1C1917] text-[#F7EFE3] font-bold text-xs rounded-2xl shadow-[0_10px_24px_-4px_rgba(28,25,23,0.4),0_4px_8px_-2px_rgba(28,25,23,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_14px_28px_-4px_rgba(28,25,23,0.5)] active:scale-98 transition text-center"
        >
          View Order Details
        </button>

        <button
          onClick={onBackToHome}
          className="w-full py-3.5 px-5 bg-[#FAF4EC] hover:bg-[#EFE5D8] border border-[#E8DDCF] text-[#1C1917] font-bold text-xs rounded-2xl shadow-[0_4px_12px_rgba(28,25,23,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] active:scale-98 transition text-center"
        >
          Back to Home
        </button>
      </div>

      {/* Subtle Crown Watermark Doodle */}
      <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none select-none text-9xl">
        👑
      </div>
    </div>
  );
};
