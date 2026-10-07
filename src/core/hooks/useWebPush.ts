import { useState, useEffect, useCallback } from 'react';

export interface UseWebPushResult {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  requestPermissionAndSubscribe: (vapidPublicKey?: string) => Promise<PushSubscription | null>;
}

export function useWebPush(): UseWebPushResult {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      // Check existing subscription
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setSubscription(sub);
        })
        .catch((err) => console.warn('Could not inspect push subscription', err));
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPermissionAndSubscribe = useCallback(
    async (vapidPublicKey?: string): Promise<PushSubscription | null> => {
      if (!isSupported) {
        console.warn('Web push is not supported in this browser.');
        return null;
      }

      try {
        const permResult = await Notification.requestPermission();
        setPermission(permResult);

        if (permResult !== 'granted') {
          return null;
        }

        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();

        if (!sub && vapidPublicKey) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        setSubscription(sub);
        return sub;
      } catch (err) {
        console.error('Error enabling web push notifications:', err);
        return null;
      }
    },
    [isSupported]
  );

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    subscription,
    requestPermissionAndSubscribe,
  };
}
