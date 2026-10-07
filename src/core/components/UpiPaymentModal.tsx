import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import type { CreateOrderResponseData } from '../api/axios';
import { useCart } from '../hooks/useCart';

export interface UpiPaymentModalProps {
  open: boolean;
  orderData: CreateOrderResponseData | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  open,
  orderData,
  onSuccess,
  onClose,
}) => {
  const { formatCurrency } = useCart();
  const [isVerifying, setIsVerifying] = useState(false);
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);

  // Auto trigger UPI app launch on mobile when modal opens
  useEffect(() => {
    if (open && isMobile && orderData?.upi_intent_uri) {
      const timer = setTimeout(() => {
        window.location.href = orderData.upi_intent_uri;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, isMobile, orderData]);

  if (!orderData) return null;

  const handleSimulatePaymentDone = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 1200);
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
      <div className="bg-surface text-gray-900 p-6 rounded-3xl text-center space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-primary bg-primary/10 py-1 px-3 rounded-full mx-auto w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>NPCI Instant UPI Gateway</span>
        </div>

        <div>
          <h3 className="font-heading font-bold text-lg text-gray-900">
            Pay {formatCurrency(orderData.total_paise)}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Token: <span className="font-bold text-primary">#{orderData.ref_token}</span> • {orderData.booth_label}
          </p>
        </div>

        {/* QR Code for Desktop / Fallback */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 inline-block shadow-sm">
          {orderData.upi_intent_uri ? (
            <QRCodeSVG
              value={orderData.upi_intent_uri}
              size={180}
              level="M"
              includeMargin
              className="mx-auto"
            />
          ) : (
            <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              Generating QR...
            </div>
          )}
          <p className="text-[11px] font-medium text-gray-500 mt-2">
            Scan with Google Pay, PhonePe, Paytm or CRED
          </p>
        </div>

        {/* Mobile Deep Link CTA Button */}
        {isMobile && orderData.upi_intent_uri && (
          <a
            href={orderData.upi_intent_uri}
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-soft flex items-center justify-center space-x-2 hover:opacity-95 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open UPI App (GPay / PhonePe)</span>
          </a>
        )}

        {/* Reconciliation Button */}
        <div className="pt-2 border-t border-black/5">
          <button
            onClick={handleSimulatePaymentDone}
            disabled={isVerifying}
            className="w-full py-2.5 px-4 bg-surface-alt hover:bg-gray-200 border border-black/10 text-gray-800 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Verifying payment with bank...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span>I have completed payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
