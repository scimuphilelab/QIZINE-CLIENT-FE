import { useState, useEffect, useRef, useCallback } from 'react';
import type { OrderStatus, PaymentStatus, OrderResponse } from '../types/order.types';

export interface OrderStatusUpdate {
  order_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  estimated_ready_at?: string;
  timestamp: string;
}

export interface UseOrderStatusOptions {
  orderId?: string | null;
  serverUrl?: string;
  pollIntervalMs?: number;
  initialOrder?: OrderResponse | null;
}

export function useOrderStatus({
  orderId,
  serverUrl,
  pollIntervalMs = 5000,
  initialOrder = null,
}: UseOrderStatusOptions) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    initialOrder?.status || 'INITIATED'
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialOrder?.payment_status || 'PENDING'
  );
  const [estimatedReadyAt, setEstimatedReadyAt] = useState<string | undefined>(
    initialOrder?.estimated_ready_at
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const handleStatusUpdate = useCallback((update: OrderStatusUpdate) => {
    setCurrentStatus(update.status);
    setPaymentStatus(update.payment_status);
    if (update.estimated_ready_at) {
      setEstimatedReadyAt(update.estimated_ready_at);
    }
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!orderId) return;

    // Connect via SSE if serverUrl is provided
    if (serverUrl && typeof window !== 'undefined' && 'EventSource' in window) {
      const sseUrl = `${serverUrl}/api/v1/orders/${orderId}/stream`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data: OrderStatusUpdate = JSON.parse(event.data);
          handleStatusUpdate(data);
        } catch (e) {
          console.error('Error parsing SSE order status', e);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
      };

      return () => {
        es.close();
        eventSourceRef.current = null;
      };
    } else {
      // Simulative / polling mode for local or fallback setups
      const interval = setInterval(() => {
        // Stop simulated progression once terminal states are reached
        setCurrentStatus((prev) => {
          if (prev === 'INITIATED') return 'ACCEPTED';
          if (prev === 'ACCEPTED') return 'PREPARING';
          if (prev === 'PREPARING') return 'READY';
          return prev;
        });
      }, pollIntervalMs);

      return () => clearInterval(interval);
    }
  }, [orderId, serverUrl, pollIntervalMs, handleStatusUpdate]);

  const isTerminal =
    currentStatus === 'SERVED' || currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  return {
    orderId,
    currentStatus,
    paymentStatus,
    estimatedReadyAt,
    isConnected,
    isTerminal,
    lastUpdated,
  };
}
