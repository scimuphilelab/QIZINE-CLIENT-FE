import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
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
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);

  // Platform detection
  const isIos = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Default tab: On iOS start on 'apps' picker, on Android/desktop start on 'qr'
  const [activeTab, setActiveTab] = useState<'apps' | 'qr'>(isIos ? 'apps' : 'qr');

  const effectiveUpiId = orderData?.upi_id || upiId || '';
  const upiUri = orderData?.upi_intent_uri || (
    effectiveUpiId && orderData
      ? `upi://pay?pa=${effectiveUpiId}&pn=Restaurant&am=${(orderData.total_paise / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Token: ${orderData.ref_token} | OrderId: ${orderData.order_id}`)}&tr=${encodeURIComponent(orderData.ref_token)}`
      : ''
  );

  // Extract query string to build app-specific iOS deep-links
  const upiQueryString = upiUri.includes('?') ? upiUri.split('?')[1] : '';

  // Trigger auto UPI intent launch ONLY for Android (preserves Android native multi-app chooser)
  useEffect(() => {
    if (open && isAndroid && upiUri) {
      const timer = setTimeout(() => {
        try {
          window.location.href = upiUri;
        } catch {
          // Handled gracefully if browser blocks auto-deep link
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [open, isAndroid, upiUri]);

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

  const handleLaunchApp = (appName: string, deepLink: string) => {
    setLaunchingApp(appName);
    window.location.href = deepLink;
    setTimeout(() => setLaunchingApp(null), 3000);
  };

  // iOS-specific apps list with dedicated URL schemes
  const upiApps = [
    {
      id: 'phonepe',
      name: 'PhonePe',
      desc: 'Pay with PhonePe UPI',
      color: '#5F259F',
      bgHover: 'hover:border-[#5F259F]/40 hover:bg-[#5F259F]/5',
      deepLink: `phonepe://pay?${upiQueryString}`,
      icon: (
        <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
          <circle cx="24" cy="24" r="24" fill="#5F259F" />
          <path
            d="M26.8 14H19.5c-.8 0-1.5.7-1.5 1.5v17c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-5.2h5.8c4.2 0 7.2-2.8 7.2-6.7 0-3.8-3-6.6-7.2-6.6zm0 10.2h-5.8v-7.2h5.8c2.4 0 4.2 1.5 4.2 3.6 0 2.2-1.8 3.6-4.2 3.6z"
            fill="#FFF"
          />
        </svg>
      ),
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      desc: 'Pay with GPay',
      color: '#4285F4',
      bgHover: 'hover:border-[#4285F4]/40 hover:bg-blue-50/50',
      deepLink: `gpay://upi/pay?${upiQueryString}`,
      icon: (
        <svg viewBox="0 0 48 48" className="w-6 h-6">
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      ),
    },
    {
      id: 'paytm',
      name: 'Paytm',
      desc: 'Pay with Paytm UPI',
      color: '#002E6E',
      bgHover: 'hover:border-[#002E6E]/40 hover:bg-sky-50/50',
      deepLink: `paytmmp://pay?${upiQueryString}`,
      icon: (
        <svg viewBox="0 0 48 48" className="w-6 h-6">
          <circle cx="24" cy="24" r="24" fill="#002E6E" />
          <path d="M12 21h4.2c2.1 0 3.5 1.1 3.5 3s-1.4 3-3.5 3H14.5v5H12V21zm2.5 4.3h1.6c.9 0 1.5-.4 1.5-1.3s-.6-1.3-1.5-1.3h-1.6v2.6z" fill="#00BAF2"/>
          <path d="M22 28.2c0-2.5 1.7-4 4.2-4s4.2 1.5 4.2 4v3.8h-2.3v-3.7c0-1.2-.7-1.9-1.9-1.9s-1.9.7-1.9 1.9v3.7H22v-3.8z" fill="#FFF"/>
          <path d="M33 21h2.5v11H33V21z" fill="#00BAF2"/>
        </svg>
      ),
    },
    {
      id: 'cred',
      name: 'CRED',
      desc: 'Pay with CRED UPI',
      color: '#111827',
      bgHover: 'hover:border-stone-800 hover:bg-stone-100',
      deepLink: `cred://upi/pay?${upiQueryString}`,
      icon: (
        <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
          <circle cx="24" cy="24" r="24" fill="#18181B" />
          <path
            d="M24 13L15 18.2v11.6l9 5.2 9-5.2V18.2L24 13zm6.5 15.3l-6.5 3.8-6.5-3.8V19.9l6.5-3.8 6.5 3.8v8.4z"
            fill="#FFF"
          />
        </svg>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      footer={null}
      closable={!isVerifying}
      onCancel={onClose}
      centered
      width={430}
      className="p-0 overflow-hidden rounded-3xl"
    >
      <div className="bg-[#FAF9F7] text-stone-900 p-5 sm:p-6 rounded-3xl text-center space-y-3.5 font-sans selection:bg-[#FF5722]/20 selection:text-[#FF5722]">
        {/* Header Badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-black text-[#FF5722] bg-[#FFF4EE] border border-[#FFD7C5] py-1 px-3.5 rounded-full mx-auto w-fit uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NPCI Instant UPI Payment</span>
        </div>

        {/* Amount & Order details */}
        <div>
          <h3 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
            Pay {formatCurrency(orderData.total_paise)}
          </h3>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Token: <span className="font-mono font-bold text-[#FF5722]">#{orderData.ref_token}</span>
            {orderData.booth_label && ` • Table ${orderData.booth_label}`}
          </p>
        </div>

        {/* iOS Mode: Choose UPI App Segmented Controls */}
        {isIos && (
          <div className="flex bg-stone-200/70 p-1 rounded-2xl max-w-xs mx-auto text-xs font-heading font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('apps')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'apps'
                  ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Choose App</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>
          </div>
        )}

        {/* Content View 1: iOS Dedicated App Chooser */}
        {isIos && activeTab === 'apps' && (
          <div className="space-y-2.5 pt-1">
            <p className="text-xs text-stone-500 font-medium">
              Tap your preferred UPI app on this iPhone:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {upiApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleLaunchApp(app.name, app.deepLink)}
                  className={`p-3 bg-white border border-stone-200 rounded-2xl text-left flex items-center space-x-2.5 shadow-2xs active:scale-95 transition cursor-pointer ${app.bgHover}`}
                >
                  <div className="shrink-0">{app.icon}</div>
                  <div className="overflow-hidden min-w-0">
                    <p className="font-heading font-black text-xs text-stone-900 truncate">
                      {app.name}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium truncate">
                      {app.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Other UPI App Option (BHIM, WhatsApp, etc.) */}
            <button
              type="button"
              onClick={() => handleLaunchApp('UPI', upiUri)}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-2xl text-left flex items-center justify-between text-stone-700 active:scale-95 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#FF5722]" />
                <span className="font-heading font-bold text-xs text-stone-800">
                  Other UPI App (BHIM, WhatsApp, etc.)
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {launchingApp && (
              <p className="text-[11px] text-[#FF5722] font-semibold animate-pulse pt-1">
                Opening {launchingApp}... Complete the payment and tap below.
              </p>
            )}
          </div>
        )}

        {/* Content View 2: QR Code (Visible on Android, Desktop, or iOS QR Tab) */}
        {(!isIos || activeTab === 'qr') && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs inline-block">
              {upiUri ? (
                <div className="flex flex-col items-center">
                  <QRCodeSVG
                    value={upiUri}
                    size={175}
                    level="M"
                    includeMargin={false}
                    className="mx-auto rounded-lg"
                  />
                  <p className="text-[11px] font-semibold text-stone-500 mt-2.5 max-w-[210px]">
                    Scan with Google Pay, PhonePe, Paytm, CRED or BHIM
                  </p>
                </div>
              ) : (
                <div className="w-44 h-44 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400 font-medium">
                  Awaiting UPI Details...
                </div>
              )}
            </div>

            {/* Copyable UPI ID */}
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
          </div>
        )}

        {/* Android Primary Action Button (preserves native Android intent chooser) */}
        {isAndroid && upiUri && (
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
            className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-heading font-black text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-2xs active:scale-95 transition disabled:opacity-50 cursor-pointer"
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
