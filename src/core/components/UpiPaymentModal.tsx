import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Copy, Check } from 'lucide-react';
import type { CreateOrderResponseData } from '../api/axios';
import { useCart } from '../hooks/useCart';

export interface UpiPaymentModalProps {
  open: boolean;
  orderData: CreateOrderResponseData | null;
  upiId?: string | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  open,
  orderData,
  upiId,
  onSuccess,
  onClose,
}) => {
  const { formatCurrency } = useCart();
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const effectiveUpiId = orderData?.upi_id || upiId || '';
  const upiUri = orderData?.upi_intent_uri || (
    effectiveUpiId && orderData
      ? `upi://pay?pa=${effectiveUpiId}&pn=Restaurant&am=${(orderData.total_paise / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Token: ${orderData.ref_token} | OrderId: ${orderData.order_id}`)}&tr=${encodeURIComponent(orderData.ref_token)}`
      : ''
  );

  // Trigger UPI app launch on mobile when user opens modal
  useEffect(() => {
    if (open && isMobile && upiUri) {
      const timer = setTimeout(() => {
        try {
          window.location.href = upiUri;
        } catch {
          // Handled gracefully if browser blocks auto-deep link
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [open, isMobile, upiUri]);

  if (!orderData) return null;

  const handleCopyUpiId = () => {
    if (!effectiveUpiId) return;
    navigator.clipboard?.writeText(effectiveUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPaid = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 800);
  };

  return (
    <Modal
      open={open}
      footer={null}
      closable={!isVerifying}
      onCancel={onClose}
      centered
      width={420}
      className="p-0 overflow-hidden rounded-3xl"
    >
      <div className="bg-[#FAF9F7] text-stone-900 p-6 rounded-3xl text-center space-y-4 font-sans selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
        {/* Header Badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-black text-[#FF5722] bg-[#FFF4EE] border border-[#FFD7C5] py-1 px-3.5 rounded-full mx-auto w-fit uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NPCI Instant UPI Payment</span>
        </div>

        <div>
          <h3 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
            Pay {formatCurrency(orderData.total_paise)}
          </h3>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Token: <span className="font-mono font-bold text-[#FF5722]">#{orderData.ref_token}</span>
            {orderData.booth_label && ` • Table ${orderData.booth_label}`}
          </p>
        </div>

        {/* Dynamic QR Code for Desktop or Fallback */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs inline-block">
          {upiUri ? (
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={upiUri}
                size={180}
                level="M"
                includeMargin={false}
                className="mx-auto rounded-lg"
              />
              <p className="text-[11px] font-semibold text-stone-500 mt-3 max-w-[200px]">
                Scan with Google Pay, PhonePe, Paytm, CRED or BHIM
              </p>
            </div>
          ) : (
            <div className="w-44 h-44 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400 font-medium">
              Awaiting UPI Details...
            </div>
          )}
        </div>

        {/* Copyable UPI ID pill if available */}
        {effectiveUpiId && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] text-stone-500 font-medium font-mono bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
              UPI: <span className="font-bold text-stone-800">{effectiveUpiId}</span>
            </span>
            <button
              onClick={handleCopyUpiId}
              type="button"
              className="p-1 rounded-lg text-stone-500 hover:text-[#FF5722] hover:bg-[#FFF4EE] transition cursor-pointer"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Mobile UPI Deep Link CTA Button */}
        {upiUri && (
          <a
            href={upiUri}
            className="w-full py-3.5 px-4 bg-[#FF5722] hover:bg-[#F4511E] text-white font-heading font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 active:scale-95 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open UPI App (Pay ₹{(orderData.total_paise / 100).toFixed(0)})</span>
          </a>
        )}

        {/* Payment Confirmation Button */}
        <div className="pt-2 border-t border-stone-200/60">
          <button
            onClick={handleConfirmPaid}
            disabled={isVerifying}
            type="button"
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-heading font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-2xs active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5722]" />
                <span>Submitting payment confirmation...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>I Have Completed Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
          <p className="text-[10px] text-stone-400 mt-2 font-normal">
            Your order will be verified by the restaurant manager before food preparation begins.
          </p>
        </div>
      </div>
    </Modal>
  );
};
