import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { ENV, API_ENDPOINTS } from '../../config/env';
import type { MongoMenuDocument } from '../types/menu.types';
import type { QRBoothContext, OrderStatus, PaymentStatus, ServingModel } from '../types/order.types';
import { normalizeResolveData } from '../utils/menuNormalizer';
import { cleanUserMessage } from '../utils/userMessage';

/**
 * Standard API Response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Fast-path resolution response from backend
 */
export interface ResolveResponseData {
  booth: {
    id: string;
    label: string;
    zone?: string;
    seats?: number;
    serving_model: ServingModel;
    qr_code_key?: string;
  };
  vendor: {
    id: string;
    name: string;
    business_type: string;
    slug?: string;
    serving_model?: ServingModel;
    accept_order_type: 'PREPAID' | 'POSTPAID';
    order_confirmation_model: string;
    upi_id?: string | null;
    currency: string;
    currency_symbol: string;
    is_open: boolean;
    opening_time: string;
    closing_time: string;
  };
  menu: MongoMenuDocument;
}

/**
 * Zero-Trust Order payload format according to CLIENT-FRM.md Section 6.2
 */
export interface CreateOrderRequest {
  qr_key: string;
  idempotency_key: string;
  customer_name?: string;
  customer_phone?: string;
  customer_note?: string;
  payment_method: 'UPI' | 'CASH' | 'CARD';
  web_notif_config?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  items: Array<{
    item_id: string;
    variant_id?: string;
    quantity: number;
    customizations?: Array<{
      group_id: string;
      option_id: string;
    }>;
  }>;
}

export interface CreateOrderResponseData {
  order_id: string;
  order_no: number;
  ref_token: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_paise: number;
  currency: string;
  booth_label: string;
  serving_model: 'WAITER_SERVING' | 'SELF_SERVING' | 'DELIVERY';
  accept_order_type?: 'PREPAID' | 'POSTPAID';
  upi_id?: string | null;
  upi_intent_uri: string;
}

/**
 * Instantiate Universal Axios Client
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-header-secret': ENV.HEADER_SECRET,
  },
});

// Request Interceptor: Injects timestamp and client headers
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Timestamp'] = new Date().toISOString();
    config.headers['x-header-secret'] = ENV.HEADER_SECRET;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardizes error messages
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ success?: boolean; message?: string; error?: string }>) => {
    let rawError = 'Unable to connect. Please try again.';
    if (error.response?.data?.message) {
      rawError = error.response.data.message;
    } else if (error.response?.data?.error) {
      rawError = error.response.data.error;
    } else if (error.message) {
      rawError = error.message;
    }
    const cleanMsg = cleanUserMessage(rawError, 'Unable to connect. Please try again.');
    return Promise.reject(new Error(cleanMsg));
  }
);

/**
 * Universal API Services Object
 */
export const QizineApi = {
  /**
   * View 1: Fast-Path Menu & Booth Resolution from Backend
   */
  async resolveMenu(qrKey: string): Promise<ResolveResponseData> {
    const cleanedKey = qrKey.trim();
    if (!cleanedKey) {
      throw new Error('Please scan a valid table QR code.');
    }

    try {
      const scanUrl = API_ENDPOINTS.QR_SCAN(cleanedKey);
      const response = await apiClient.get<ApiResponse<any>>(scanUrl);

      if (response.data?.success && response.data?.data) {
        return normalizeResolveData(response.data.data);
      }

      if (response.data && response.data.data) {
        return normalizeResolveData(response.data.data);
      }

      throw new Error(cleanUserMessage(response.data?.message, 'Menu not found. Please scan QR again.'));
    } catch (err: any) {
      const message = cleanUserMessage(
        err.response?.data?.message || err.message,
        'Menu not found. Please scan QR again.'
      );
      throw new Error(message);
    }
  },

  /**
   * View 4 & 5: Zero-Trust Order Placement
   */
  async createOrder(
    payload: CreateOrderRequest,
    idempotencyKey: string
  ): Promise<CreateOrderResponseData> {
    try {
      // Format items to match QR-ORDER-BE OrderManager.placeCustomerOrder requirements
      const backendPayload = {
        qr_key: payload.qr_key,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_note: payload.customer_note,
        payment_method: payload.payment_method,
        web_notif_config: payload.web_notif_config,
        items: payload.items.map((it) => ({
          item_id: it.item_id,
          variant_id: it.variant_id,
          qty: it.quantity,
          addon_ids: it.customizations?.map((c) => c.option_id) || [],
        })),
      };

      const response = await apiClient.post<ApiResponse<CreateOrderResponseData>>(
        API_ENDPOINTS.CREATE_ORDER,
        backendPayload,
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error(cleanUserMessage(response.data?.message, 'Unable to place order. Please try again.'));
    } catch (err: any) {
      const message = cleanUserMessage(
        err.response?.data?.message || err.response?.data?.error || err.message,
        'Unable to place order. Please try again.'
      );
      throw new Error(message);
    }
  },

  /**
   * View 6: Fetch Order Details
   */
  async getOrder(orderId: string, refToken?: string): Promise<CreateOrderResponseData> {
    const url = API_ENDPOINTS.ORDER_DETAIL(orderId, refToken);
    const response = await apiClient.get<ApiResponse<CreateOrderResponseData>>(url);
    return response.data.data;
  },

  /**
   * View 6: Customer Order Cancellation (Only when status == 'INITIATED')
   */
  async cancelOrder(orderId: string, refToken: string, reason?: string): Promise<boolean> {
    const url = API_ENDPOINTS.ORDER_CANCEL(orderId);
    const response = await apiClient.post<ApiResponse<null>>(url, {
      ref_token: refToken,
      reason: reason || 'Customer requested cancellation',
    });
    return response.data.success;
  },

  /**
   * View 8: Waiter Call & Floor Service Request
   */
  async sendServiceRequest(payload: {
    qr_key: string;
    type: string;
    custom_note?: string;
  }): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.SERVICE_REQUEST,
      payload
    );
    return response.data?.success ?? true;
  },

  /**
   * View 7: Web Push Notification Subscription Registration
   */
  async registerPushSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.SUBSCRIBE_PUSH,
        subscription.toJSON()
      );
      return response.data?.success ?? true;
    } catch (err) {
      console.warn(`[QizineApi] WebPush register failed:`, err);
      return false;
    }
  },
};
