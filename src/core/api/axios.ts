import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { ENV, API_ENDPOINTS } from '../../config/env';
import type { MongoMenuDocument } from '../types/menu.types';
import type { QRBoothContext, OrderStatus, PaymentStatus } from '../types/order.types';
import { SAMPLE_MENU } from '../data/sampleMenu';

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
    serving_model: 'WAITER_SERVING' | 'SELF_SERVING' | 'DELIVERY';
  };
  vendor: {
    id: string;
    name: string;
    business_type: string;
    slug?: string;
    accept_order_type: 'PREPAID' | 'POSTPAID';
    order_confirmation_model: string;
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
  },
});

// Request Interceptor: Injects timestamp and client headers
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardizes error messages
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    let errorMessage = 'Network error or service unavailable.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Universal API Services Object
 */
export const QizineApi = {
  /**
   * View 1: Fast-Path Menu & Booth Resolution
   */
  async resolveMenu(qrKey: string): Promise<ResolveResponseData> {
    try {
      const response = await apiClient.get<ApiResponse<ResolveResponseData>>(
        `${API_ENDPOINTS.MENU_RESOLVE}?q=${encodeURIComponent(qrKey)}`
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Invalid menu resolution response');
    } catch (err) {
      if (ENV.ENABLE_MOCK_FALLBACK) {
        console.warn(`[QizineApi] Backend resolution failed, using fallback mock dataset:`, err);
        return {
          booth: {
            id: 'bth_table_4',
            label: 'Table 04',
            zone: 'Indoor AC',
            seats: 4,
            serving_model: 'WAITER_SERVING',
          },
          vendor: {
            id: SAMPLE_MENU.cafe_id,
            name: SAMPLE_MENU.cafe_profile.name,
            business_type: 'CAFE',
            slug: 'chai-break-patia',
            accept_order_type: 'PREPAID',
            order_confirmation_model: 'MANUAL',
            currency: SAMPLE_MENU.cafe_profile.currency || 'INR',
            currency_symbol: SAMPLE_MENU.cafe_profile.currency_symbol || '₹',
            is_open: true,
            opening_time: '09:00:00',
            closing_time: '23:00:00',
          },
          menu: SAMPLE_MENU,
        };
      }
      throw err;
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
      const response = await apiClient.post<ApiResponse<CreateOrderResponseData>>(
        API_ENDPOINTS.CREATE_ORDER,
        payload,
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Unexpected order response format');
    } catch (err) {
      if (ENV.ENABLE_MOCK_FALLBACK) {
        console.warn(`[QizineApi] Order API unavailable, simulating instant order response.`);
        await new Promise((res) => setTimeout(res, 600));

        const orderNo = Math.floor(10 + Math.random() * 90);
        const refToken = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
        const orderId = `ord_${Date.now()}`;
        const totalPaise = 32400; // Simulated
        const upiUri = `upi://pay?pa=chaibreak@icici&pn=ChaiBreakCafe&tr=${orderId}&am=${(totalPaise / 100).toFixed(2)}&cu=INR&tn=Order_${refToken}`;

        return {
          order_id: orderId,
          order_no: orderNo,
          ref_token: refToken,
          status: 'INITIATED',
          payment_status: 'PENDING',
          total_paise: totalPaise,
          currency: 'INR',
          booth_label: 'Table 04',
          serving_model: 'WAITER_SERVING',
          upi_intent_uri: upiUri,
        };
      }
      throw err;
    }
  },

  /**
   * View 6: Fetch Order Details
   */
  async getOrder(orderId: string, refToken?: string): Promise<CreateOrderResponseData> {
    try {
      const url = API_ENDPOINTS.ORDER_DETAIL(orderId, refToken);
      const response = await apiClient.get<ApiResponse<CreateOrderResponseData>>(url);
      return response.data.data;
    } catch (err) {
      if (ENV.ENABLE_MOCK_FALLBACK) {
        return {
          order_id: orderId,
          order_no: 42,
          ref_token: refToken || '7A29',
          status: 'ACCEPTED',
          payment_status: 'SUCCESS',
          total_paise: 32400,
          currency: 'INR',
          booth_label: 'Table 04',
          serving_model: 'WAITER_SERVING',
          upi_intent_uri: '',
        };
      }
      throw err;
    }
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
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        API_ENDPOINTS.SERVICE_REQUEST,
        payload
      );
      return response.data?.success ?? true;
    } catch (err) {
      if (ENV.ENABLE_MOCK_FALLBACK) {
        console.log(`[QizineApi] Simulated service request acknowledged:`, payload);
        return true;
      }
      throw err;
    }
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
