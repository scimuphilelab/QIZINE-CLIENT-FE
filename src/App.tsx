import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { MenuProvider } from './core/context/MenuContext';
import { CartProvider } from './core/context/CartContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { resolveTemplate, TEMPLATE_REGISTRY, DEFAULT_TEMPLATE_ID } from './templates/registry';
import { QizineApi, type ResolveResponseData } from './core/api/axios';
import { ClosedStoreBanner } from './core/components/ClosedStoreBanner';
import { UniversalErrorPage } from './core/components/UniversalErrorPage';
import type { QRBoothContext } from './core/types/order.types';
import type { MongoMenuDocument } from './core/types/menu.types';
import {
  LayoutGrid,
  Check,
  UtensilsCrossed,
  QrCode,
  Search,
  X,
  Store,
  Sparkles,
} from 'lucide-react';

const getInitialQrKey = (): string => {
  try {
    const url = new URL(window.location.href);
    const param =
      url.searchParams.get('booth') ||
      url.searchParams.get('q') ||
      url.searchParams.get('qr') ||
      url.searchParams.get('qr_code_key');
    if (param && param.trim()) return param.trim();

    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'scan' && pathParts[1]) {
      return decodeURIComponent(pathParts[1].trim());
    }

    const saved = localStorage.getItem('qizine_last_qr_key');
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // fallback
  }
  // Default to active test booth key for seamless local preview
  return 'qr_oe234pwumurkd59y';
};

export const App: React.FC = () => {
  // Active QR Key state (from URL ?booth=...)
  const [activeQrKey, setActiveQrKey] = useState<string>(getInitialQrKey);
  const [qrInput, setQrInput] = useState<string>('');
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  // Fast-path resolution state
  const [loading, setLoading] = useState<boolean>(Boolean(activeQrKey));
  const [error, setError] = useState<string | null>(
    activeQrKey ? null : 'Please scan an active table or counter QR code to view the menu.'
  );
  const [resolutionData, setResolutionData] = useState<ResolveResponseData | null>(null);

  // Template override state (from URL ?tpl=... or dynamically resolved from Mongo document)
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Sync state if user navigates via browser history
  useEffect(() => {
    const handlePopState = () => {
      const current = getInitialQrKey();
      setActiveQrKey(current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch backend data whenever activeQrKey changes
  const fetchMenuData = useCallback((key: string) => {
    const trimmed = key.trim();
    if (!trimmed) {
      setResolutionData(null);
      setError('Please scan an active table or counter QR code to view the menu.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    QizineApi.resolveMenu(trimmed)
      .then((data) => {
        setResolutionData(data);
        try {
          localStorage.setItem('qizine_last_qr_key', trimmed);
        } catch {
          // ignore
        }

        // Dynamically resolve template from Mongo document design_config.template_id
        const searchParams = new URLSearchParams(window.location.search);
        const urlTpl = searchParams.get('tpl');
        const mongoTemplateId = data.menu.design_config?.template_id;

        setCurrentTemplateId(urlTpl || mongoTemplateId || DEFAULT_TEMPLATE_ID);
      })
      .catch((err) => {
        setResolutionData(null);
        setError(err instanceof Error ? err.message : 'Invalid or inactive QR code.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMenuData(activeQrKey);
  }, [activeQrKey, fetchMenuData]);

  // Handle QR Search submission
  const handleQrSearch = (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setActiveQrKey(trimmed);
    setQrModalOpen(false);

    try {
      const newUrl = new URL(window.location.href);
      newUrl.pathname = '/search';
      newUrl.searchParams.set('booth', trimmed);
      newUrl.searchParams.delete('q');
      newUrl.searchParams.delete('qr');
      newUrl.searchParams.delete('qr_code_key');
      window.history.pushState({}, '', newUrl.toString());
    } catch {
      // Ignored
    }
  };

  // Booth context resolved from backend
  const boothContext: QRBoothContext | null = useMemo(() => {
    if (!resolutionData) return null;
    return {
      booth_id: resolutionData.booth.id,
      booth_label: resolutionData.booth.label,
      zone: resolutionData.booth.zone,
      vendor_id: resolutionData.vendor.id,
      vendor_name: resolutionData.vendor.name,
      serving_model: resolutionData.booth.serving_model,
      accept_order_type: resolutionData.vendor.accept_order_type,
    };
  }, [resolutionData]);

  // View 1: Branded Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF4EC] text-[#1C1917] p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#1C1917] text-[#FAF4EC] flex items-center justify-center shadow-[0_8px_20px_rgba(28,25,23,0.25)] animate-pulse mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-xl text-[#1C1917] tracking-tight">
          Qizine Dining
        </h2>
        <p className="text-xs text-[#7E756B] mt-1 font-medium animate-pulse">
          Connecting to table & fetching digital menu from backend...
        </p>
        {activeQrKey && (
          <span className="mt-3 text-[11px] font-mono bg-[#EFE5D8] px-3 py-1 rounded-full text-[#7E756B] border border-[#E2D5C3]">
            QR Key: {activeQrKey}
          </span>
        )}
      </div>
    );
  }

  // View 2: Universal Error Page (when key is missing or invalid)
  if (error || !resolutionData) {
    return (
      <UniversalErrorPage
        message={error || 'Invalid or inactive QR code. Please scan an active booth QR.'}
        currentKey={activeQrKey || undefined}
        onRetry={() => {
          if (activeQrKey) {
            fetchMenuData(activeQrKey);
          }
        }}
        onSearchKey={handleQrSearch}
      />
    );
  }

  const activeMenu: MongoMenuDocument = resolutionData.menu;
  const isStoreClosed = !resolutionData.vendor.is_open;

  // Resolve template component dynamically from backend template_id
  const resolvedTemplate = resolveTemplate(currentTemplateId);
  const TemplateComponent = resolvedTemplate.component;

  return (
    <ThemeProvider designConfig={activeMenu.design_config}>
      <MenuProvider initialMenu={activeMenu}>
        <CartProvider
          taxRatePercent={activeMenu.settings?.tax_rate_percent ?? 5}
          serviceChargePercent={activeMenu.settings?.service_charge_percent ?? 0}
        >
          {/* Operating Hours Guard Banner */}
          {isStoreClosed && (
            <ClosedStoreBanner
              vendorName={resolutionData.vendor.name}
              openingTime={resolutionData.vendor.opening_time || '08:00:00'}
              closingTime={resolutionData.vendor.closing_time || '23:00:00'}
            />
          )}

          {/* Dynamic Template Loader */}
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#FAF4EC] text-[#1C1917]">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-75">
                    Rendering {resolvedTemplate.name}...
                  </p>
                </div>
              </div>
            }
          >
            <TemplateComponent booth={boothContext || undefined} />
          </Suspense>

          {/* Floating Top Controls: QR Search/Scan & Template Switcher */}
          <div className="fixed top-3 right-3 z-50 flex items-center space-x-2">
            {/* QR Scan / Booth Search Button */}
            <button
              onClick={() => {
                setQrInput(activeQrKey);
                setQrModalOpen(true);
              }}
              className="bg-[#1C1917]/90 hover:bg-[#1C1917] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(28,25,23,0.3)] backdrop-blur-md flex items-center space-x-1.5 transition active:scale-95 border border-white/10"
              title="Scan or Search QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span>{resolutionData.booth.label}</span>
            </button>

            {/* Template Selector Badge */}
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="bg-[#1C1917]/90 hover:bg-[#1C1917] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(28,25,23,0.3)] backdrop-blur-md flex items-center space-x-1.5 transition active:scale-95 border border-white/10"
              title="Template Switcher"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span>{resolvedTemplate.name.split(' ')[0]}</span>
            </button>
          </div>

          {/* Template Switcher Dropdown */}
          {switcherOpen && (
            <div className="fixed top-14 right-3 z-50 w-64 bg-[#FAF4EC] rounded-2xl shadow-[0_16px_36px_rgba(28,25,23,0.25)] border border-[#E8DDCF] p-2 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 border-b border-[#E8DDCF] mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#7E756B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Templates
                </p>
                <button
                  onClick={() => setSwitcherOpen(false)}
                  className="text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {Object.values(TEMPLATE_REGISTRY).map((tpl) => {
                  const isSelected = tpl.id === resolvedTemplate.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setCurrentTemplateId(tpl.id);
                        setSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF4EC] font-semibold shadow-xs'
                          : 'hover:bg-[#EFE5D8] text-[#1C1917]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold leading-tight">{tpl.name}</p>
                        <p className="text-[10px] opacity-75">{tpl.recommendedFor}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-2 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QR Code Scan / Search Modal */}
          {qrModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FAF4EC] rounded-3xl max-w-sm w-full p-5 shadow-[0_24px_48px_rgba(28,25,23,0.35)] border border-[#E8DDCF] text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCF]">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1C1917] text-white flex items-center justify-center shadow-xs">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-sm text-[#1C1917]">
                        Scan or Search QR
                      </h3>
                      <p className="text-[10px] text-[#7E756B]">
                        Fetch booth & digital menu from backend
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQrModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-[#EFE5D8] hover:bg-[#E5DACD] text-[#1C1917] flex items-center justify-center transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-[10px] font-bold text-[#7E756B] uppercase tracking-wider block mb-1">
                    Enter Booth QR Key or Table ID
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#7E756B] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. qr_3m0hhmnnmurkd5l7"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQrSearch(qrInput)}
                      className="w-full bg-[#EFE5D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1917] placeholder-[#7E756B] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 border border-[#E2D5C3]"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-[#7E756B] uppercase tracking-wider mb-1.5">
                    Active Booth Key:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['qr_3m0hhmnnmurkd5l7'].map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          setQrInput(k);
                          handleQrSearch(k);
                        }}
                        className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition ${
                          activeQrKey === k
                            ? 'bg-[#1C1917] text-white border-black'
                            : 'bg-white hover:bg-[#EFE5D8] text-[#1C1917] border-[#E8DDCF]'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Booth Details */}
                {resolutionData && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-[#E8DDCF] text-xs">
                    <div className="flex items-center space-x-2 text-[#1C1917] font-bold mb-1">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{resolutionData.vendor.name}</span>
                    </div>
                    <p className="text-[11px] text-[#7E756B]">
                      Booth: <span className="font-semibold text-[#1C1917]">{resolutionData.booth.label}</span>
                      {resolutionData.booth.zone && ` • ${resolutionData.booth.zone}`}
                    </p>
                    <p className="text-[10px] text-[#7E756B] mt-0.5">
                      Template: <span className="font-mono text-emerald-700">{activeMenu.design_config?.template_id || 'default'}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setQrModalOpen(false)}
                    className="flex-1 py-2 text-xs font-semibold text-[#7E756B] hover:bg-[#EFE5D8] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleQrSearch(qrInput)}
                    className="flex-1 py-2 bg-[#1C1917] hover:bg-black text-[#FAF4EC] text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(28,25,23,0.3)] transition active:scale-95"
                  >
                    Fetch Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </CartProvider>
      </MenuProvider>
    </ThemeProvider>
  );
};

export default App;
