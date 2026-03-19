import { api } from "../axios";
import type {
  SensorWindowsQuery,
  SensorWindowsResponse,
} from "../../types/sensorWindow.types";

export const sensorWindowsApi = {
  findAll: (query?: SensorWindowsQuery) =>
    api
      .get<SensorWindowsResponse>("/sensor-windows", { params: query })
      .then((res) => res.data),
};
