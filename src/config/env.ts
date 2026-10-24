/**
 * Environment Configuration & Backend API Endpoints Registry
 * Mapped to QR-ORDER-BE Express routes (/v1/...) & CLIENT-FRM.md
 */

export const ENV = {
  APP_BASE_URL:
    (import.meta.env.VITE_APP_BASE_URL as string) ||
    (import.meta.env.APP_BASE_URL as string) ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://qizine-client-fe.pages.dev'),
  ADMIN_BASE_URL:
    (import.meta.env.VITE_ADMIN_BASE_URL as string) ||
    (import.meta.env.ADMIN_BASE_URL as string) ||
    'https://qizine-admin-fe.pages.dev',
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ||
    (import.meta.env.API_BASE_URL as string) ||
    'https://qr-ordering-service-be.onrender.com/v1',
  HEADER_SECRET: (import.meta.env.VITE_HEADER_SECRET as string) || (import.meta.env.HEADER_SECRET as string) || 'qz_sec_live_9b83f0e1d4c7a5268394e1b7f205c6d83a19e2f4705c1d84b2e6a9f0375c81d2',
  ENABLE_MOCK_FALLBACK: (import.meta.env.VITE_ENABLE_MOCK_FALLBACK as string) !== 'false',
  VAPID_PUBLIC_KEY: (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) || '',
  IS_DEV: import.meta.env.DEV,
} as const;

export const API_ENDPOINTS = {
  /**
   * Public Customer QR Scan (QR-ORDER-BE):
   * GET /v1/qr-booths/scan/:qr_code_key
   */
  QR_SCAN: (qrCodeKey: string) => `/qr-booths/scan/${encodeURIComponent(qrCodeKey)}`,

  /**
   * Fast-Path Menu Resolve Fallback:
   * GET /api/v1/menu/resolve?q=:qr_key
   */
  MENU_RESOLVE: (qrKey: string) => `/api/v1/menu/resolve?q=${encodeURIComponent(qrKey)}`,

  /**
   * Place Order (QR-ORDER-BE):
   * POST /v1/orders/create
   */
  CREATE_ORDER: '/orders/create',

  /**
   * Order Details (QR-ORDER-BE):
   * GET /v1/orders/fetch-details/:id
   */
  ORDER_DETAIL: (orderId: string, refToken?: string) =>
    refToken ? `/orders/fetch-details/${orderId}?token=${encodeURIComponent(refToken)}` : `/orders/fetch-details/${orderId}`,

  /**
   * Customer Self-Cancellation (QR-ORDER-BE):
   * POST /v1/orders/cancel/:id
   */
  ORDER_CANCEL: (orderId: string) => `/orders/cancel/${orderId}`,

  /**
   * Real-Time SSE Stream (QR-ORDER-BE):
   * GET /v1/events/stream?order_id=:id&vendor_id=:vendor_id
   */
  ORDER_STREAM: (orderId: string, vendorId?: string) =>
    `${ENV.API_BASE_URL}/events/stream?order_id=${encodeURIComponent(orderId)}${vendorId ? `&vendor_id=${encodeURIComponent(vendorId)}` : ''}&header_secret=${encodeURIComponent(ENV.HEADER_SECRET)}`,

  /**
   * Floor Assistance & Call Waiter (QR-ORDER-BE):
   * POST /v1/service-requests/create
   */
  SERVICE_REQUEST: '/service-requests/create',

  /**
   * Web Push Subscription
   */
  SUBSCRIBE_PUSH: '/notifications/subscribe',
} as const;
