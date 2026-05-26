import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "../api/endpoints/devices.api";
import type {
  CreateDeviceDto,
  DeviceQuery,
  UpdateDeviceDto,
} from "../types/device.types";
import { useEffect, useState } from "react";

export const deviceKeys = {
  all: ["devices"] as const,
  list: (query?: DeviceQuery) => [...deviceKeys.all, "list", query] as const,
  detail: (id: number) => [...deviceKeys.all, "detail", id] as const,
};

const LIMIT = 10;

export function useDevices(filters: DeviceQuery = {}) {
  const [page, setPage] = useState(1);

  // reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters.name, filters.status, filters.isActive]);

  const query = { ...filters, page, limit: LIMIT };

  const result = useQuery({
    queryKey: deviceKeys.list(query),
    queryFn: () => devicesApi.findAll(query),
  });

  const totalPages = result.data ? Math.ceil(result.data.meta.total / LIMIT) : 1;

  return {
    ...result,
    page,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => devicesApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDeviceDto) => devicesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useUpdateDevice(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDeviceDto) => devicesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useActivateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useDeactivateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}

export function useRefreshApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.refreshApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) });
    },
  });
}
