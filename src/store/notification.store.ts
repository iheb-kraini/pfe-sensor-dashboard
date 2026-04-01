import { create } from "zustand";
import {
  type Notification,
  NotificationState,
} from "../types/notification.types";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  // actions
  setNotifications: (notifications: Notification[]) => void;
  appendNotification: (notification: Notification) => void;
  updateNotificationState: (id: number, state: NotificationState) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter(
        (n) => n.state === NotificationState.UNREAD,
      ).length,
    }),

  appendNotification: (notification) => {
    const updated = [notification, ...get().notifications];
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => n.state === NotificationState.UNREAD)
        .length,
    });
  },

  updateNotificationState: (id, state) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, state } : n,
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => n.state === NotificationState.UNREAD)
        .length,
    });
  },
}));
