import { useEffect, useState } from "react";
import { notificationsApi } from "../api/endpoints/notifications.api";
import { toaster } from "../components/ui/toaster";
import type {
  NotificationFilters,
  NotificationState,
} from "../types/notification.types";
import { useNotificationStore } from "../store/notification.store";

const LIMIT = 12;

export function useNotifications(filters: NotificationFilters = {}) {
  const {
    notifications,
    setNotifications,
    updateNotificationState,
    setUnreadCount,
  } = useNotificationStore();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // fetch true total unread count once — independent of pagination
  useEffect(() => {
    notificationsApi
      .getAll({ state: "unread", limit: 1, page: 1 })
      .then((res) => setUnreadCount(res.meta.total))
      .catch(() => {});
  }, []);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters)]);

  // fetch current page
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    notificationsApi
      .getAll({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setNotifications(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {
        setIsError(true);
        toaster.create({
          type: "error",
          title: "Failed to load notifications",
        });
      })
      .finally(() => setIsLoading(false));
  }, [JSON.stringify(filters), page]);

  const changeState = async (id: number, state: NotificationState) => {
    try {
      await notificationsApi.updateState(id, state);
      updateNotificationState(id, state);

      toaster.create({ type: "success", title: "Notification updated" });
    } catch {
      toaster.create({ type: "error", title: "Failed to update notification" });
    }
  };

  return {
    notifications,
    isLoading,
    isError,
    total,
    page,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    changeState,
  };
}
