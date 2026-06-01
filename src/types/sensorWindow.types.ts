export interface AccelSample {
  x: number;
  y: number;
  z: number;
}

export interface SensorWindow {
  id: number;
  recordedAt: string;
  lat: number | null;
  lon: number | null;
  speedKmph: number | null;
  satellites: number | null;
  gpsSynced: boolean;
  samples: AccelSample[];
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

export interface VibrationAnalysis {
  rms: { x: number; y: number; z: number };
  peakToPeak: { x: number; y: number; z: number };
  fft: {
    dominantFreq: number;
    amplitude: number;
    peaks: { freq: number; amplitude: number }[];
    freqResolution: number;
  };
  processedAt: string;
}

export interface AnalysisWindow {
  id: number;
  recordedAt: string;
  analysis: VibrationAnalysis;
}

export interface AnalysisResponse {
  data: AnalysisWindow[];
}

export interface QueryAnalysisDto {
  fields?: string;
  from?: string;
  to?: string;
}
