import type { AccelSample } from "../types/sensorWindow.types";

export interface AxisMetrics {
  rms: number;
  p2p: number;
  min: number;
  max: number;
}

export interface SensorMetrics {
  x: AxisMetrics;
  y: AxisMetrics;
  z: AxisMetrics;
  dominantAxis: "x" | "y" | "z";
}

function computeAxis(values: number[]): AxisMetrics {
  if (values.length === 0) return { rms: 0, p2p: 0, min: 0, max: 0 };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const rms = Math.sqrt(
    values.reduce((sum, v) => sum + v * v, 0) / values.length,
  );

  return { rms, p2p: max - min, min, max };
}

export function computeMetrics(samples: AccelSample[]): SensorMetrics {
  const xs = samples.map((s) => s.x);
  const ys = samples.map((s) => s.y);
  const zs = samples.map((s) => s.z);

  const x = computeAxis(xs);
  const y = computeAxis(ys);
  const z = computeAxis(zs);

  const dominantAxis = (["x", "y", "z"] as const).reduce((a, b) =>
    ({ x, y, z })[a].rms >= { x, y, z }[b].rms ? a : b,
  );

  return { x, y, z, dominantAxis };
}
