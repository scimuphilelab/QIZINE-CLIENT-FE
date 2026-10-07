import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { MenuProvider } from './core/context/MenuContext';
import { CartProvider } from './core/context/CartContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { resolveTemplate, TEMPLATE_REGISTRY } from './templates/registry';
import { QizineApi, type ResolveResponseData } from './core/api/axios';
import { SAMPLE_MENU } from './core/data/sampleMenu';
import { ClosedStoreBanner } from './core/components/ClosedStoreBanner';
import type { QRBoothContext } from './core/types/order.types';
import type { MongoMenuDocument } from './core/types/menu.types';
import { LayoutGrid, Check, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const qrKey = searchParams.get('q') || 'qr_default';

  // Fast-path resolution state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolutionData, setResolutionData] = useState<ResolveResponseData | null>(null);

  // Template override state (from URL ?tpl=... or menu design_config)
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('tpl_swiggy_modern');
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // View 1: Fast-Path Resolver Hook
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    QizineApi.resolveMenu(qrKey)
      .then((data) => {
        if (!isMounted) return;
        setResolutionData(data);
        const urlTpl = searchParams.get('tpl');
        const defaultTpl = data.menu.design_config.template_id || 'tpl_swiggy_modern';
        setCurrentTemplateId(urlTpl || defaultTpl);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to resolve QR code.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrKey, searchParams]);

  // Booth context resolved from backend
  const boothContext: QRBoothContext = useMemo(() => {
    if (!resolutionData) {
      return {
        booth_id: 'bth_default',
        booth_label: 'Table 04',
        vendor_id: SAMPLE_MENU.cafe_id,
        vendor_name: SAMPLE_MENU.cafe_profile.name,
        serving_model: 'WAITER_SERVING',
        accept_order_type: 'PREPAID',
      };
    }
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

  const activeMenu: MongoMenuDocument = resolutionData?.menu || SAMPLE_MENU;
  const isStoreClosed = resolutionData?.vendor && !resolutionData.vendor.is_open;

  // Resolve template component from 3 workable templates
  const resolvedTemplate = resolveTemplate(currentTemplateId);
  const TemplateComponent = resolvedTemplate.component;

  // View 1: Branded Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-gray-900 p-6">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-soft animate-pulse mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-lg text-gray-900 tracking-tight">
          Qizine Dining
        </h2>
        <p className="text-xs text-muted mt-1 animate-pulse">
          Connecting to table & preparing menu...
        </p>
      </div>
    );
  }

  // View 1: Error Screen
  if (error && !resolutionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-gray-900 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-bold text-base text-gray-900">
          Invalid or Expired QR Code
        </h2>
        <p className="text-xs text-muted max-w-xs mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ThemeProvider designConfig={activeMenu.design_config}>
      <MenuProvider initialMenu={activeMenu}>
        <CartProvider
          taxRatePercent={activeMenu.settings.tax_rate_percent}
          serviceChargePercent={activeMenu.settings.service_charge_percent}
        >
          {/* Operating Hours Guard Banner */}
          {isStoreClosed && resolutionData && (
            <ClosedStoreBanner
              vendorName={resolutionData.vendor.name}
              openingTime={resolutionData.vendor.opening_time}
              closingTime={resolutionData.vendor.closing_time}
            />
          )}

          {/* Dynamic Template Loader */}
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background text-primary">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-75">
                    Loading {resolvedTemplate.name}...
                  </p>
                </div>
              </div>
            }
          >
            <TemplateComponent booth={boothContext} />
          </Suspense>

          {/* Dev Template Switcher Badge */}
          <div className="fixed top-3 right-3 z-50">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="bg-black/80 hover:bg-black text-white text-[11px] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-all"
              title="Switch Template"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-semibold">{resolvedTemplate.name.split(' ')[0]}</span>
            </button>

            {switcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl shadow-floating border border-black/10 p-2 text-left z-50">
                <div className="px-2.5 py-1.5 border-b border-black/5 mb-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Workable Templates (3 Active)
                  </p>
                </div>
                <div className="space-y-1">
                  {Object.values(TEMPLATE_REGISTRY).map((tpl) => {
                    const isSelected = tpl.id === currentTemplateId;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => {
                          setCurrentTemplateId(tpl.id);
                          setSwitcherOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'hover:bg-black/5 text-gray-800'
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
          </div>
        </CartProvider>
      </MenuProvider>
    </ThemeProvider>
  );
};

export default App;
