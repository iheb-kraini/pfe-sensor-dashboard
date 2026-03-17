import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "../api/endpoints/devices.api";
import type {
  CreateDeviceDto,
  DeviceQuery,
  UpdateDeviceDto,
} from "../types/device.types";

export const deviceKeys = {
  all: ["devices"] as const,
  list: (query?: DeviceQuery) => [...deviceKeys.all, "list", query] as const,
  detail: (id: number) => [...deviceKeys.all, "detail", id] as const,
};

export function useDevices(query?: DeviceQuery) {
  return useQuery({
    queryKey: deviceKeys.list(query),
    queryFn: () => devicesApi.findAll(query),
  });
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
