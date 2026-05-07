import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../api/endpoints/stats.api";

export function useAdminStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => statsApi.get(),
    staleTime: 30_000,
  });

  return {
    isLoading,
    totalUsers: data?.totalUsers ?? 0,
    activeUsers: data?.activeUsers ?? 0,
    totalDevices: data?.totalDevices ?? 0,
    onlineDevices: data?.onlineDevices ?? 0,
    totalAlerts: data?.totalAlerts ?? 0,
    unreadAlerts: data?.unreadAlerts ?? 0,
  };
}
