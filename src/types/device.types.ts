import type { JwtPayload } from "./auth.types";

export const DeviceStatus = {
  ONLINE: "online",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
} as const;

export type DeviceStatus = (typeof DeviceStatus)[keyof typeof DeviceStatus];

export interface Device {
  id: number;
  name: string;
  serialNumber: string;
  status: DeviceStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: JwtPayload;
  apiKey: string | null;
}

export interface DevicesResponse {
  data: Device[];
  total: number;
  page: number;
  limit: number;
}

export interface DeviceQuery {
  name?: string;
  status?: DeviceStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateDeviceDto {
  name: string;
  serialNumber: string;
  status?: DeviceStatus;
  isActive?: boolean;
}

export interface UpdateDeviceDto {
  name?: string;
  serialNumber?: string;
  status?: DeviceStatus;
  isActive?: boolean;
}
