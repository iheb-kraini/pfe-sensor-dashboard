import { api } from "../axios";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  onlineDevices: number;
  totalAlerts: number;
  unreadAlerts: number;
}

export const statsApi = {
  get: () => api.get<AdminStats>("/stats").then((res) => res.data),
};
