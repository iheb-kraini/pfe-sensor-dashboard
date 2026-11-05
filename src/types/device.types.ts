import type { JwtPayload } from "./auth.types";

export interface Device {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: JwtPayload;
  apiKey: string | null;
}

export interface DevicesResponse {
  data: Device[];
  meta: { total: number; page: number; limit: number };
}

export interface DeviceQuery {
  name?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateDeviceDto {
  name: string;
  isActive?: boolean;
}

export interface UpdateDeviceDto {
  name?: string;
  isActive?: boolean;
}
