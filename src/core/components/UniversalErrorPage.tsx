import React, { useState } from 'react';
import { AlertCircle, QrCode, ArrowRight, RefreshCw, Sparkles, Store } from 'lucide-react';

export interface UniversalErrorPageProps {
  message: string;
  currentKey?: string;
  onRetry?: () => void;
  onSearchKey: (key: string) => void;
}

export const UniversalErrorPage: React.FC<UniversalErrorPageProps> = ({
  message,
  currentKey,
  onRetry,
  onSearchKey,
}) => {
  const [inputKey, setInputKey] = useState(currentKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (trimmed) {
      onSearchKey(trimmed);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#1C1917] flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-[#1C1917] selection:text-[#FAF4EC]">
      {/* Brand Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#1C1917] text-[#FAF4EC] flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(28,25,23,0.2)]">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-serif font-black text-lg tracking-tight text-[#1C1917]">
            Qizine
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8276] bg-[#EFE5D8] px-2.5 py-1 rounded-full border border-[#E2D5C3]">
          Customer Portal
        </span>
      </header>

      {/* Main Error Box */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_18px_40px_-10px_rgba(28,25,23,0.12),0_4px_12px_rgba(0,0,0,0.04)] border border-[#E8DDCF] relative overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

          {/* Error Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_20px_rgba(225,29,72,0.15)] border border-rose-100">
            <AlertCircle className="w-8 h-8 stroke-[2.2]" />
          </div>

          {/* Error Message */}
          <div className="text-center mb-6">
            <h1 className="font-serif font-black text-xl sm:text-2xl text-[#1C1917] tracking-tight mb-2">
              Unable to Open Menu
            </h1>
            <p className="text-xs sm:text-sm text-[#7E756B] leading-relaxed max-w-sm mx-auto font-medium">
              {message}
            </p>

            {currentKey && (
              <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#8E8276] bg-[#FAF4EC] px-3 py-1 rounded-full border border-[#E2D5C3]">
                <QrCode className="w-3.5 h-3.5" />
                <span>Scanned: {currentKey}</span>
              </div>
            )}
          </div>

          {/* Search or Enter QR Key Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="booth-key-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#8E8276] mb-1.5 ml-1"
              >
                Scan or Enter Booth QR Key
              </label>
              <div className="relative">
                <input
                  id="booth-key-input"
                  type="text"
                  placeholder="e.g. qr_3m0hhmnnmurkd5l7"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-[#FAF4EC] border border-[#E2D5C3] rounded-2xl pl-4 pr-11 py-3 text-xs sm:text-sm text-[#1C1917] placeholder-[#A89E92] font-mono focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 focus:border-[#1C1917] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                />
                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="absolute right-2 top-2 bottom-2 w-8 rounded-xl bg-[#1C1917] text-[#FAF4EC] flex items-center justify-center hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Search Booth"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Quick Demo Booth Links */}
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-[#8E8276] block mb-1.5 ml-1">
                Active Booth Keys:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['qr_3m0hhmnnmurkd5l7'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setInputKey(sample);
                      onSearchKey(sample);
                    }}
                    className="text-[11px] font-mono font-medium bg-[#FAF4EC] hover:bg-[#EFE5D8] text-[#1C1917] border border-[#E2D5C3] px-2.5 py-1 rounded-xl transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#1C1917] hover:bg-black text-[#FAF4EC] text-xs font-bold transition flex items-center justify-center space-x-2 shadow-[0_4px_14px_rgba(28,25,23,0.3)] active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center pb-2">
        <p className="text-[11px] text-[#A89E92] font-medium">
          Powered by Qizine Universal Restaurant Experience
        </p>
      </footer>
    </div>
  );
};
