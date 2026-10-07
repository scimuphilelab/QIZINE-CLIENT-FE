import { useState, useCallback } from 'react';
import { useCartContext } from '../context/CartContext';
import type { CreateOrderPayload, OrderResponse, QRBoothContext } from '../types/order.types';

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
    (amountRupees: number, orderRef: string, note?: string): string => {
      const vpa = options.upiVpa || 'merchant@upi';
      const name = encodeURIComponent(options.merchantName || 'Qizine Vendor');
      const transactionNote = encodeURIComponent(note || `Order #${orderRef}`);
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

      const idempotencyKey = generateIdempotencyKey();

      const payload: CreateOrderPayload = {
        vendor_id: booth.vendor_id,
        booth_id: booth.booth_id,
        customer_name: customerDetails?.name,
        customer_phone: customerDetails?.phone,
        special_instructions: customerDetails?.instructions,
        serving_model: booth.serving_model,
        accept_order_type: booth.accept_order_type,
        idempotency_key: idempotencyKey,
        items: items.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          variant_id: item.variant_id,
          variant_name: item.variant_name,
          quantity: item.quantity,
          unit_price_paise: item.unit_price_paise,
          addons: item.selected_addons.map((a) => ({
            id: a.id,
            name: a.name,
            price_paise: a.price_paise,
          })),
          special_instructions: item.special_instructions,
        })),
      };

      try {
        // If an API endpoint is provided, make the HTTP call:
        let responseData: OrderResponse;

        if (options.apiBaseUrl) {
          const res = await fetch(`${options.apiBaseUrl}/api/v1/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || `Order placement failed with status ${res.status}`);
          }
          responseData = await res.json();
        } else {
          // Mock / Prototype simulated dispatch
          await new Promise((resolve) => setTimeout(resolve, 800));
          const simulatedRef = `#${Math.floor(1000 + Math.random() * 9000)}`;
          const amountRupees = calculation.grand_total_paise / 100;
          const upiUrl = generateUpiIntentUrl(amountRupees, simulatedRef);

          responseData = {
            order_id: `ord_${Date.now()}`,
            ref_token: simulatedRef,
            vendor_id: booth.vendor_id,
            booth_id: booth.booth_id,
            booth_label: booth.booth_label,
            status: booth.accept_order_type === 'PREPAID' ? 'INITIATED' : 'ACCEPTED',
            payment_status: booth.accept_order_type === 'PREPAID' ? 'PENDING' : 'PENDING',
            upi_intent_url: upiUrl,
            total_amount_paise: calculation.grand_total_paise,
            created_at: new Date().toISOString(),
          };
        }

        setOrderResult(responseData);
        clearCart();
        return responseData;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to place order';
        setError(message);
        throw err;
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
