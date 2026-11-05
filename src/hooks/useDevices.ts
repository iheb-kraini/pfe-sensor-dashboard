import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "../api/endpoints/devices.api";
import type {
  CreateDeviceDto,
  DeviceQuery,
  UpdateDeviceDto,
} from "../types/device.types";
import { useEffect, useState } from "react";
import { toaster } from "../components/ui/toaster";

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
  }, [filters.name, filters.isActive]);

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
      toaster.create({ type: "success", title: "Device created" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to create device";
      toaster.create({ type: "error", title });
    },
  });
}

export function useUpdateDevice(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDeviceDto) => devicesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toaster.create({ type: "success", title: "Device updated" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to update device";
      toaster.create({ type: "error", title });
    },
  });
}

export function useActivateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toaster.create({ type: "success", title: "Device activated" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to activate device";
      toaster.create({ type: "error", title });
    },
  });
}

export function useDeactivateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
      toaster.create({ type: "success", title: "Device deactivated" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to deactivate device";
      toaster.create({ type: "error", title });
    },
  });
}

export function useRefreshApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => devicesApi.refreshApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) });
      toaster.create({ type: "success", title: "API key refreshed" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to refresh API key";
      toaster.create({ type: "error", title });
    },
  });
}
