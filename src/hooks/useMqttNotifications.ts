import { useEffect, useRef } from "react";
import mqtt from "mqtt";
import type { MqttClient } from "mqtt";
import { useNotificationStore } from "../store/notification.store";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "../utils/token";
import { playNotificationSound } from "../components/notifications/NotificationSound";
import type { Notification, SeverityLevel } from "../types/notification.types";
import { toaster } from "../components/ui/toaster";

const BROKER_URL = "ws://192.168.1.23:9001";

export function useMqttNotifications() {
  const { user, isAdmin } = useAuthStore();
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!user || !token) {
      // Disconnect if exists
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
      return;
    }

    // Disconnect existing client before creating new one (e.g., token refresh)
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }

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
      console.log("MQTT connected ✓ topic:", topic);
      client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) console.error("Subscribe failed:", err);
        else console.log("Subscribed to:", topic);
      });
    });

    client.on("message", (_topic, message) => {
      console.log("MQTT message received:", _topic, message.toString());
      try {
        const alert = JSON.parse(message.toString());

        // Determine severity from metrics vs thresholds
        let severity: SeverityLevel = "medium";
        const maxRmsFactor = Math.max(
          alert.sensorWindow.metrics.rms.x / alert.thresholds.rms,
          alert.sensorWindow.metrics.rms.y / alert.thresholds.rms,
          alert.sensorWindow.metrics.rms.z / alert.thresholds.rms,
        );
        if (maxRmsFactor >= 2.0) severity = "critical";
        else if (maxRmsFactor >= 1.5) severity = "high";

        // Build a Notification object
        const notification: Notification = {
          id: Date.now(), // temporary; backend will provide real ID later
          deviceId: alert.deviceId,
          userId: alert.userId,
          state: "unread",
          severity: severity,
          message: `Vibration alert: ${alert.reasons.join(", ")}`,
          sensorSnapshot: alert.sensorWindow?.metrics,
          createdAt: alert.sensorWindow?.recordedAt || new Date().toISOString(),
          resolvedAt: null,
          device: undefined, // optionally fetch device name from API
          sensorWindowId: undefined,
          sensorWindow: alert.sensorWindow,
        };

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
      } catch (err) {
        console.error("Failed to parse MQTT message:", err);
      }
    });

    client.on("error", (err) => console.error("MQTT error:", err));
    client.on("close", () => console.log("MQTT connection closed"));

    // Cleanup on unmount or before next effect run (user change)
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, [user, isAdmin]); // Depend on user and isAdmin (isAdmin will change if user changes)
}
