import type {
  NotificationFilters,
  NotificationState,
  PaginatedNotifications,
} from "../../types/notification.types";
import { api } from "../axios";

export const notificationsApi = {
  getAll: (filters: NotificationFilters = {}) =>
    api.get<PaginatedNotifications>("/notifications", { params: filters }),

  updateState: (id: number, state: NotificationState) =>
    api.patch(`/notifications/${id}/state`, { state }),
};
