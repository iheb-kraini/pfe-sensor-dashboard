import { useQuery } from "@tanstack/react-query";
import { devicesApi } from "../api/endpoints/devices.api";
import { notificationsApi } from "../api/endpoints/notifications.api";
import { usersApi } from "../api/endpoints/users.api";

export function useAdminStats() {
  const users = useQuery({
    queryKey: ["admin-stats-users"],
    queryFn: () => usersApi.findAll({ limit: 1, page: 1 }),
  });

  const activeUsers = useQuery({
    queryKey: ["admin-stats-active-users"],
    queryFn: () => usersApi.findAll({ limit: 1, page: 1, isActive: true }),
  });

  const devices = useQuery({
    queryKey: ["admin-stats-devices"],
    queryFn: () => devicesApi.findAll({ limit: 1, page: 1 }),
  });

  const onlineDevices = useQuery({
    queryKey: ["admin-stats-online-devices"],
    queryFn: () => devicesApi.findAll({ limit: 1, page: 1, status: "online" }),
  });

  const recentAlerts = useQuery({
    queryKey: ["admin-stats-alerts"],
    queryFn: () => notificationsApi.getAll({ limit: 1, page: 1 }),
  });

  const isLoading =
    users.isLoading ||
    activeUsers.isLoading ||
    devices.isLoading ||
    onlineDevices.isLoading ||
    recentAlerts.isLoading;

  return {
    isLoading,
    totalUsers: users.data?.meta.total ?? 0,
    activeUsers: activeUsers.data?.meta.total ?? 0,
    totalDevices: devices.data?.meta.total ?? 0,
    onlineDevices: onlineDevices.data?.meta.total ?? 0,
    totalAlerts: recentAlerts.data?.meta?.total ?? 0,
  };
}
