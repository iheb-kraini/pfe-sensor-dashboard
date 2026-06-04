import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useNotificationStore } from "../store/notification.store";
import { useAuthStore } from "../store/auth.store";
import { tokenStorage } from "../utils/token";
import { playNotificationSound } from "../components/notifications/NotificationSound";
import type { Notification } from "../types/notification.types";
import { toaster } from "../components/ui/toaster";

const SOCKET_URL = "http://localhost:3000/notifications";

export function useSocketNotifications() {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected ✓");
    });

    socket.on("notification", (data: Notification) => {
      console.log("Notification received:", data);

      useNotificationStore.getState().appendNotification(data);
      playNotificationSound();
      toaster.create({
        type:
          data.severity === "critical"
            ? "error"
            : data.severity === "high"
              ? "warning"
              : "info",
        title: "New alert",
        description: data.message,
        duration: 6000,
      });
    });

    socket.on("error", (err) => console.error("Socket error:", err));
    socket.on("disconnect", (reason) =>
      console.log("Socket disconnected:", reason),
    );

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);
}
