import type { SensorWindow } from "./sensorWindow.types";

export const NotificationState = {
  UNREAD: "unread",
  IN_INVESTIGATION: "in_investigation",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export type NotificationState =
  (typeof NotificationState)[keyof typeof NotificationState];
// Type = "unread" | "in_investigation" | "resolved" | "dismissed"

export const SeverityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type SeverityLevel = (typeof SeverityLevel)[keyof typeof SeverityLevel];

export interface Notification {
  id: number;
  deviceId: number;
  userId: number;
  sensorWindowId: number;
  sensorWindowTime: string;
  state: NotificationState;
  severity: SeverityLevel;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
  device?: { id: number; name: string };
  sensorWindow?: SensorWindow;
}

export interface NotificationFilters {
  from?: string;
  to?: string;
  state?: NotificationState;
  severity?: SeverityLevel;
  deviceId?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: { total: number; page: number; limit: number; pages: number };
}
