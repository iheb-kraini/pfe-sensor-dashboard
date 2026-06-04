import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { pushApi } from "../api/endpoints/push.api";

const VAPID_PUBLIC_KEY =
  "BP1jEM_OQnWcvblF_f92rbGKCFDNlXbm3FopfWx1ou6Padye9EjfrwgGKzlXi_IF5BcqxQp-G9_U4pT75qRV3xc";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function useWebPush() {
  const { user } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const permissionDenied =
    typeof Notification !== "undefined" &&
    Notification.permission === "denied";

  // Register SW and check current subscription
  useEffect(() => {
    if (!isSupported) {
      setIsChecking(false);
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered ✓", reg.scope);
        registrationRef.current = reg;
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        console.log("Push subscription:", sub ? "active" : "none");
        if (sub) console.log("  endpoint:", sub.endpoint.slice(0, 50) + "...");
        setIsSubscribed(!!sub);
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
        setIsSubscribed(false);
      })
      .finally(() => setIsChecking(false));
  }, [isSupported]);

  // Auto-unsubscribe on logout
  useEffect(() => {
    if (!user) {
      unsubscribeBrowser();
      setIsSubscribed(false);
      pushApi.unsubscribe().catch(() => {});
    }
  }, [user]);

  const subscribe = async () => {
    setIsPending(true);
    try {
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
      if (permission !== "granted") {
        setIsSubscribed(false);
        return;
      }

      let reg = registrationRef.current;
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
        registrationRef.current = reg;
      }

      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log("PushManager subscribed ✓");
      const subJson = subscription.toJSON();
      console.log("Sending subscription to backend...");
      await pushApi.subscribe(subJson);
      console.log("Backend subscribe OK ✓");
      setIsSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  const unsubscribe = async () => {
    setIsPending(true);
    try {
      console.log("Unsubscribing from backend...");
      await pushApi.unsubscribe();
      console.log("Backend unsubscribe OK");
      await unsubscribeBrowser();
      console.log("Browser unsubscribe OK");
      setIsSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  const unsubscribeBrowser = async () => {
    const reg = registrationRef.current;
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  };

  return {
    isSupported,
    isSubscribed,
    isPending,
    isChecking,
    permissionDenied,
    subscribe,
    unsubscribe,
  };
}
