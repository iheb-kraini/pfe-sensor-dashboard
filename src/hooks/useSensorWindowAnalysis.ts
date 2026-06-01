import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { sensorWindowsApi } from "../api/endpoints/sensorWindows.api";
import type { AnalysisWindow } from "../types/sensorWindow.types";

const DEFAULT_LIMIT = 20;

export const sensorWindowAnalysisKeys = {
  all: ["sensor-window-analysis"] as const,
  list: (deviceId: number, from?: string, to?: string) =>
    [...sensorWindowAnalysisKeys.all, deviceId, { from, to }] as const,
};

export function useSensorWindowAnalysis({
  deviceId,
  from,
  to,
  limit = DEFAULT_LIMIT,
}: {
  deviceId: number;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const [page, setPage] = useState(1);

  const queryKey = sensorWindowAnalysisKeys.list(deviceId, from, to);

  useEffect(() => {
    setPage(1);
  }, [from, to]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      sensorWindowsApi.getAnalysis(deviceId, { from, to }),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const allWindows = data?.data ?? [];

  const totalPages = Math.max(1, Math.ceil(allWindows.length / limit));
  const safePage = Math.min(page, totalPages);

  const paginatedData: AnalysisWindow[] = useMemo(
    () => allWindows.slice((safePage - 1) * limit, safePage * limit),
    [allWindows, safePage, limit],
  );

  return {
    data: paginatedData,
    allData: allWindows,
    total: allWindows.length,
    isLoading,
    isError,
    page: safePage,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
