/**
 * Environment Configuration & Backend API Endpoints Registry
 * Strictly mapped to CLIENT-FRM.md backend contracts
 */

export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000',
  ENABLE_MOCK_FALLBACK: (import.meta.env.VITE_ENABLE_MOCK_FALLBACK as string) !== 'false',
  VAPID_PUBLIC_KEY: (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) || '',
  IS_DEV: import.meta.env.DEV,
} as const;

export const API_ENDPOINTS = {
  /**
   * Fast-Path Menu & Booth Resolution (GET /api/v1/menu/resolve?q=:qr_key)
   */
  MENU_RESOLVE: '/api/v1/menu/resolve',

  /**
   * Zero-Trust Order Placement (POST /api/v1/orders)
   */
  CREATE_ORDER: '/api/v1/orders',

  /**
   * Fetch Single Order Summary (GET /api/v1/orders/:id?token=:ref_token)
   */
  ORDER_DETAIL: (orderId: string, refToken?: string) =>
    refToken ? `/api/v1/orders/${orderId}?token=${encodeURIComponent(refToken)}` : `/api/v1/orders/${orderId}`,

  /**
   * Customer Order Cancellation (POST /api/v1/orders/:id/cancel)
   */
  ORDER_CANCEL: (orderId: string) => `/api/v1/orders/${orderId}/cancel`,

  /**
   * Real-Time SSE Order Status Stream (GET /api/v1/orders/:id/stream?token=:ref_token)
   */
  ORDER_STREAM: (orderId: string, refToken: string) =>
    `${ENV.API_BASE_URL}/api/v1/orders/${orderId}/stream?token=${encodeURIComponent(refToken)}`,

  /**
   * Floor Assistance & Waiter Call (POST /api/v1/service-requests)
   */
  SERVICE_REQUEST: '/api/v1/service-requests',

  /**
   * Web Push Subscription Registration (POST /api/v1/notifications/subscribe)
   */
  SUBSCRIBE_PUSH: '/api/v1/notifications/subscribe',
} as const;
