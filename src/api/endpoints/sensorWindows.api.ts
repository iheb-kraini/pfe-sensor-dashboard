import { api } from "../axios";
import type {
  SensorWindow,
  SensorWindowsQuery,
  SensorWindowsResponse,
} from "../../types/sensorWindow.types";

export const sensorWindowsApi = {
  findAll: (query?: SensorWindowsQuery) =>
    api
      .get<SensorWindowsResponse>("/sensor-windows", { params: query })
      .then((res) => res.data),

  findOne: (id: number) =>
    api.get<SensorWindow>(`/sensor-windows/${id}`).then((res) => res.data),
};
