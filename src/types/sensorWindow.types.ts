export interface SensorWindow {
  id: number;
  recordedAt: string;
  lat: number | null;
  lon: number | null;
  speedKmph: number | null;
  satellites: number | null;
  gpsSynced: boolean;
  samples: number[];
}

export interface SensorWindowsResponse {
  data: SensorWindow[];
  total: number;
  page: number;
  limit: number;
}

export interface SensorWindowsQuery {
  deviceId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
