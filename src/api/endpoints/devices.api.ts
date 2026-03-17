import { api } from "../axios";
import type {
  Device,
  DeviceQuery,
  DevicesResponse,
  CreateDeviceDto,
  UpdateDeviceDto,
} from "../../types/device.types";

export const devicesApi = {
  findAll: (query?: DeviceQuery) =>
    api
      .get<DevicesResponse>("/device", { params: query })
      .then((res) => res.data),

  findOne: (id: number) =>
    api.get<Device>(`/device/${id}`).then((res) => res.data),

  create: (dto: CreateDeviceDto) =>
    api.post<Device>("/device", dto).then((res) => res.data),

  update: (id: number, dto: UpdateDeviceDto) =>
    api.patch<Device>(`/device/${id}`, dto).then((res) => res.data),

  activate: (id: number) =>
    api.patch<Device>(`/device/${id}/activate`).then((res) => res.data),

  deactivate: (id: number) =>
    api.patch<Device>(`/device/${id}/deactivate`).then((res) => res.data),

  refreshApiKey: (id: number) =>
    api
      .patch<{ apiKey: string }>(`/device/${id}/refresh-api-key`)
      .then((res) => res.data),
};
