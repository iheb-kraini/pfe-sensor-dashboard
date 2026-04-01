import { useEffect, useRef } from "react";
import mqtt, { type MqttClient } from "mqtt";
import { useNotificationStore } from "../store/notification.store";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "../utils/token";
import { playNotificationSound } from "../components/notifications/NotificationSound";
import type { Notification } from "../types/notification.types";
import { toaster } from "../components/ui/toaster";
const BROKER_URL = "ws://192.168.1.23:9001";

export function useMqttNotifications() {
  const clientRef = useRef<MqttClient | null>(null);
  const { appendNotification } = useNotificationStore();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!user || !token) return;

    // ← prevent double mount in StrictMode
    if (clientRef.current) return;

    const topic = isAdmin() ? "users/#" : `users/${user.id}/devices/#`;

    const client = mqtt.connect(BROKER_URL, {
      username: String(user.id),
      password: token,
      clientId: `frontend_${user.id}_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT connected ✓");
      client.subscribe(topic, { qos: 1 });
    });

    client.on("message", (_topic, message) => {
      try {
        const notification: Notification = JSON.parse(message.toString());
        appendNotification(notification);
        playNotificationSound();
        toaster.create({
          type:
            notification.severity === "critical"
              ? "error"
              : notification.severity === "high"
                ? "warning"
                : "info",
          title: "New alert",
          description: notification.message,
          duration: 6000,
        });
      } catch {
        console.error("Failed to parse MQTT message");
      }
    });

    client.on("error", (err) => {
      console.error("MQTT error:", err);
    });

    client.on("close", () => {
      console.log("MQTT connection closed");
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.end(true); // ← true = force close, no waiting
        clientRef.current = null;
      }
    };
  }, [user?.id]);
}
