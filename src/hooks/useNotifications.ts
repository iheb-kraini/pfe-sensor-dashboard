import { useEffect } from "react";
import { notificationsApi } from "../api/endpoints/notifications.api";
import { toaster } from "../components/ui/toaster";
import type {
  NotificationFilters,
  NotificationState,
} from "../types/notification.types";
import { useNotificationStore } from "../store/notification.store";

export function useNotifications(filters: NotificationFilters = {}) {
  const { setNotifications, updateNotificationState } = useNotificationStore();

  useEffect(() => {
    notificationsApi
      .getAll(filters)
      .then((res) => setNotifications(res.data))
      .catch(() =>
        toaster.create({
          type: "error",
          title: "Failed to load notifications",
        }),
      );
  }, [JSON.stringify(filters)]);

  const changeState = async (id: number, state: NotificationState) => {
    try {
      await notificationsApi.updateState(id, state);
      updateNotificationState(id, state);
      toaster.create({
        type: "success",
        title: "Notification updated",
      });
    } catch {
      toaster.create({
        type: "error",
        title: "Failed to update notification",
      });
    }
  };

  return { changeState };
}
