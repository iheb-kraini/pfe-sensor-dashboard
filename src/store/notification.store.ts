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
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications }),

  appendNotification: (notification) => {
    const updated = [notification, ...get().notifications];
    set({
      notifications: updated,
      // only increment if the new notification is unread
      unreadCount:
        notification.state === NotificationState.UNREAD
          ? get().unreadCount + 1
          : get().unreadCount,
    });
  },

  updateNotificationState: (id, state) => {
    const previous = get().notifications.find((n) => n.id === id);
    const wasUnread = previous?.state === NotificationState.UNREAD;
    const isNowUnread = state === NotificationState.UNREAD;
    const currentCount = get().unreadCount; // ← snapshot before set()

    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, state } : n,
    );

    set({
      notifications: updated,
      unreadCount:
        wasUnread && !isNowUnread
          ? currentCount - 1
          : !wasUnread && isNowUnread
            ? currentCount + 1
            : currentCount,
    });
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
