import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { sensorWindowsApi } from "../api/endpoints/sensorWindows.api";
import type { SensorWindowsQuery } from "../types/sensorWindow.types";

const LIMIT = 20;
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export const sensorWindowKeys = {
  all: ["sensor-windows"] as const,
  list: (query?: SensorWindowsQuery) =>
    [...sensorWindowKeys.all, "list", query] as const,
};

export function useSensorWindows(filters: SensorWindowsQuery = {}) {
  const [page, setPage] = useState(1);

  // reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters.deviceId, filters.from, filters.to]);

  const query = { ...filters, page, limit: LIMIT };

  const result = useQuery({
    queryKey: sensorWindowKeys.list(query),
    queryFn: () => sensorWindowsApi.findAll(query),
    staleTime: TWENTY_FOUR_HOURS, // data is fresh for 24h
    gcTime: TWENTY_FOUR_HOURS, // keep in cache for 24h even when unused
    enabled: !!filters.deviceId, // don't fetch until a device is selected
  });

  const totalPages = result.data ? Math.ceil(result.data.total / LIMIT) : 1;

  return {
    ...result,
    page,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
