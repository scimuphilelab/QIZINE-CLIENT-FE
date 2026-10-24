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
    <div className="min-h-screen bg-[#FAF4EE] text-stone-900 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-[#FF385C]/20 selection:text-[#FF385C]">
      {/* Brand Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FF385C] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-red-500/25">
            <Store className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="font-black text-xl tracking-tight text-stone-900">
            Qizine
          </span>
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-red-50 px-3 py-1 rounded-full border border-red-200/60">
          Customer Portal
        </span>
      </header>

      {/* Main Error Box */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 border border-stone-200/80 relative overflow-hidden">
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF512F] via-[#FF385C] to-[#DD2476]" />

          {/* Error Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#FF385C] flex items-center justify-center mx-auto mb-5 shadow-md shadow-red-500/10 border border-red-100">
            <AlertCircle className="w-8 h-8 stroke-[2.2]" />
          </div>

          {/* Error Message */}
          <div className="text-center mb-6">
            <h1 className="font-black text-xl sm:text-2xl text-stone-900 tracking-tight mb-2">
              Unable to Open Menu
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto font-medium">
              {message}
            </p>

            {currentKey && (
              <div className="mt-3.5 inline-flex items-center space-x-1.5 text-[11px] font-mono text-stone-600 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
                <QrCode className="w-3.5 h-3.5 text-stone-400" />
                <span>Scanned: {currentKey}</span>
              </div>
            )}
          </div>

          {/* Search or Enter QR Key Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="booth-key-input"
                className="block text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1.5 ml-1"
              >
                Scan or Enter Booth QR Key
              </label>
              <div className="relative">
                <input
                  id="booth-key-input"
                  type="text"
                  placeholder="e.g. qr_oe234pwumurkd59y"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-[#FAF4EE] border border-stone-200/90 rounded-2xl pl-4 pr-12 py-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C] transition shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="absolute right-2 top-2 bottom-2 w-9 rounded-xl bg-[#FF385C] text-white flex items-center justify-center hover:bg-[#E0294C] disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 shadow-md shadow-red-500/20"
                  title="Search Booth"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Quick Demo Booth Links */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-stone-400 block mb-1.5 ml-1">
                Active Booth Keys:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['qr_oe234pwumurkd59y', 'qr_3m0hhmnnmurkd5l7'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setInputKey(sample);
                      onSearchKey(sample);
                    }}
                    className="text-[11px] font-mono font-bold bg-[#FAF4EE] hover:bg-stone-200 text-stone-700 border border-stone-200/90 px-3 py-1.5 rounded-xl transition active:scale-95"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#FF385C] hover:bg-[#E0294C] text-white text-xs font-extrabold transition flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center pb-2">
        <p className="text-[11px] text-stone-400 font-medium">
          Powered by Qizine Universal Restaurant Experience
        </p>
      </footer>
    </div>
  );
};
