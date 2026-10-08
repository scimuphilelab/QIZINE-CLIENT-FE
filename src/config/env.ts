/**
 * Environment Configuration & Backend API Endpoints Registry
 * Mapped to QR-ORDER-BE Express routes (/v1/...) & CLIENT-FRM.md
 */

export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || '/v1',
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
    `${ENV.API_BASE_URL}/events/stream?order_id=${encodeURIComponent(orderId)}${vendorId ? `&vendor_id=${encodeURIComponent(vendorId)}` : ''}`,

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
