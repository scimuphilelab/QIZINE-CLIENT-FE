/**
 * Strictly typed against the PostgreSQL Schema and Universal TRD Specification
 */

export type ServingModel = 'WAITER_SERVING' | 'SELF_SERVING' | 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
export type AcceptOrderType = 'PREPAID' | 'POSTPAID';
export type OrderConfirmationModel = 'MANUAL' | 'PA_CALLBACK' | 'MA_CALLBACK' | 'HYBRID';

export type OrderStatus =
  | 'INITIATED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI_INTENT' | 'CASH' | 'CARD' | 'COUNTER';

export interface SelectedAddon {
  id: string;
  name: string;
  price_paise: number;
  group_id: string;
}

export interface CartItem {
  cart_item_id: string;
  item_id: string;
  name: string;
  diet_type: string;
  image_url?: string;
  variant_id?: string;
  variant_name?: string;
  unit_price_paise: number;
  quantity: number;
  selected_addons: SelectedAddon[];
  special_instructions?: string;
  total_price_paise: number;
}

export interface CartCalculation {
  subtotal_paise: number;
  tax_rate_percent: number;
  tax_paise: number;
  service_charge_percent: number;
  service_charge_paise: number;
  discount_paise: number;
  grand_total_paise: number;
  total_items_count: number;
}

export interface QRBoothContext {
  qr_key?: string;
  booth_id: string;
  booth_label: string;
  zone?: string;
  vendor_id: string;
  vendor_name: string;
  serving_model: ServingModel;
  accept_order_type: AcceptOrderType;
}

export interface OrderItemPayload {
  item_id: string;
  name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price_paise: number;
  addons?: Array<{
    id: string;
    name: string;
    price_paise: number;
  }>;
  special_instructions?: string;
}

export interface CreateOrderPayload {
  vendor_id: string;
  booth_id: string;
  customer_phone?: string;
  customer_name?: string;
  items: OrderItemPayload[];
  serving_model: ServingModel;
  accept_order_type: AcceptOrderType;
  special_instructions?: string;
  idempotency_key: string;
}

export interface OrderResponse {
  order_id: string;
  ref_token: string;
  vendor_id: string;
  booth_id: string;
  booth_label: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  upi_intent_url?: string;
  total_amount_paise: number;
  created_at: string;
  estimated_ready_at?: string;
}
