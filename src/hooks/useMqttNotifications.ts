import { useEffect } from "react";
import mqtt from "mqtt";
import type { MqttClient } from "mqtt";
import { useNotificationStore } from "../store/notification.store";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "../utils/token";
import { playNotificationSound } from "../components/notifications/NotificationSound";
import type { Notification } from "../types/notification.types";
import { toaster } from "../components/ui/toaster";

const BROKER_URL = "ws://192.168.1.23:9001";

// outside component — survives StrictMode remount
let client: MqttClient | null = null;

export function useMqttNotifications() {
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!user || !token) return;
    if (client?.connected) return; // already connected, skip

    const topic = isAdmin() ? "users/#" : `users/${user.id}/devices/#`;

    client = mqtt.connect(BROKER_URL, {
      username: String(user.id),
      password: token,
      clientId: `frontend_${user.id}_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    client.on("connect", () => {
      console.log("MQTT connected ✓ topic:", topic);
      client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) console.error("Subscribe failed:", err);
        else console.log("Subscribed to:", topic);
      });
    });

    client.on("message", (_topic, message) => {
      console.log("MQTT message received:", _topic, message.toString());
      try {
        const notification: Notification = JSON.parse(message.toString());

        // pull fresh store reference each time
        useNotificationStore.getState().appendNotification(notification);
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

    client.on("error", (err) => console.error("MQTT error:", err));
    client.on("close", () => console.log("MQTT connection closed"));

    // no cleanup — StrictMode should not disconnect
    return () => {};
  }, [user?.id]);

  // disconnect only on logout
  useEffect(() => {
    if (!user && client) {
      client.end(true);
      client = null;
    }
  }, [user]);
}
