import { useState, useCallback } from 'react';
import { useCartContext } from '../context/CartContext';
import type { CreateOrderPayload, OrderResponse, QRBoothContext } from '../types/order.types';
import { QizineApi } from '../api/axios';
import { cleanUserMessage } from '../utils/userMessage';

export interface UseCheckoutOptions {
  apiBaseUrl?: string;
  upiVpa?: string; // Merchant VPA e.g. "merchant@upi"
  merchantName?: string;
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const { items, calculation, clearCart } = useCartContext();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  /**
   * Generates a unique idempotency key using browser crypto or timestamp
   */
  const generateIdempotencyKey = useCallback((): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Generates a standard NPCI UPI Intent Deep Link URL
   */
  const generateUpiIntentUrl = useCallback(
    (amountRupees: number, orderRef: string, orderId?: string, note?: string): string => {
      const vpa = options.upiVpa || 'merchant@upi';
      const name = encodeURIComponent(options.merchantName || 'Qizine Vendor');
      const defaultNote = orderId ? `Token: ${orderRef} | OrderId: ${orderId}` : `Token: ${orderRef}`;
      const transactionNote = encodeURIComponent((note || defaultNote).slice(0, 60));
      const formattedAmount = amountRupees.toFixed(2);

      return `upi://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${transactionNote}&tr=${orderRef}`;
    },
    [options.upiVpa, options.merchantName]
  );

  /**
   * Dispatches the order payload to the backend server
   */
  const dispatchOrder = useCallback(
    async (
      booth: QRBoothContext,
      customerDetails?: { name?: string; phone?: string; instructions?: string }
    ): Promise<OrderResponse> => {
      if (items.length === 0) {
        throw new Error('Cannot checkout with an empty cart');
      }

      setSubmitting(true);
      setError(null);

      try {
        const idempotencyKey = generateIdempotencyKey();
        const result = await QizineApi.createOrder(
          {
            qr_key: booth.qr_key || '',
            idempotency_key: idempotencyKey,
            customer_name: customerDetails?.name,
            customer_phone: customerDetails?.phone,
            customer_note: customerDetails?.instructions,
            payment_method: 'UPI',
            items: items.map((item) => ({
              item_id: item.item_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              customizations: item.selected_addons.map((a) => ({
                group_id: a.group_id,
                option_id: a.id,
              })),
            })),
          },
          idempotencyKey
        );

        const responseData: OrderResponse = {
          order_id: result.order_id,
          ref_token: result.ref_token,
          vendor_id: booth.vendor_id,
          booth_id: booth.booth_id,
          booth_label: result.booth_label || booth.booth_label,
          status: result.status,
          payment_status: result.payment_status,
          upi_intent_url: result.upi_intent_uri,
          total_amount_paise: result.total_paise,
          created_at: new Date().toISOString(),
        };

        setOrderResult(responseData);
        clearCart();
        return responseData;
      } catch (err: unknown) {
        const message = cleanUserMessage(err, 'Unable to place order. Please try again.');
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [items, calculation, generateIdempotencyKey, generateUpiIntentUrl, options.apiBaseUrl, clearCart]
  );

  return {
    dispatchOrder,
    generateUpiIntentUrl,
    submitting,
    error,
    orderResult,
    resetOrderState: () => {
      setOrderResult(null);
      setError(null);
    },
  };
}
