import type { AccelSample } from "../types/sensorWindow.types";
import type { VibrationAnalysis } from "../types/sensorWindow.types";

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

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function fft(re: number[], im: number[]): void {
  const n = re.length;
  if (n <= 1) return;

  const half = n >> 1;
  const reEven: number[] = [];
  const imEven: number[] = [];
  const reOdd: number[] = [];
  const imOdd: number[] = [];

  for (let i = 0; i < half; i++) {
    reEven[i] = re[i << 1];
    imEven[i] = im[i << 1];
    reOdd[i] = re[(i << 1) + 1];
    imOdd[i] = im[(i << 1) + 1];
  }

  fft(reEven, imEven);
  fft(reOdd, imOdd);

  for (let k = 0; k < half; k++) {
    const angle = -2 * Math.PI * k / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tRe = cos * reOdd[k] - sin * imOdd[k];
    const tIm = cos * imOdd[k] + sin * reOdd[k];

    re[k] = reEven[k] + tRe;
    im[k] = imEven[k] + tIm;
    re[k + half] = reEven[k] - tRe;
    im[k + half] = imEven[k] - tIm;
  }
}

export function computeFft(samples: AccelSample[], sampleRate = 100): VibrationAnalysis["fft"] {
  const magnitudes = samples.map((s) => Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z));

  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const zeroCentered = magnitudes.map((v) => v - mean);

  const n = nextPow2(zeroCentered.length);
  const re = new Array<number>(n).fill(0);
  const im = new Array<number>(n).fill(0);

  for (let i = 0; i < zeroCentered.length; i++) {
    const hamming = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (zeroCentered.length - 1));
    re[i] = zeroCentered[i] * hamming;
  }

  fft(re, im);

  const halfN = n >> 1;
  const spectrum = new Array<number>(halfN);
  for (let i = 0; i < halfN; i++) {
    spectrum[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / halfN;
  }

  const freqResolution = sampleRate / n;

  const fullSpectrum: { freq: number; amplitude: number }[] = [];
  for (let i = 0; i < halfN; i++) {
    fullSpectrum.push({ freq: i * freqResolution, amplitude: spectrum[i] });
  }

  const threshold = spectrum.reduce((a, b) => a + b, 0) / spectrum.length * 1.5;
  const peaks: { freq: number; amplitude: number }[] = [];

  for (let i = 1; i < halfN - 1; i++) {
    if (spectrum[i] > threshold && spectrum[i] >= spectrum[i - 1] && spectrum[i] >= spectrum[i + 1]) {
      peaks.push({ freq: i * freqResolution, amplitude: spectrum[i] });
    }
  }

  peaks.sort((a, b) => b.amplitude - a.amplitude);
  const topPeaks = peaks.slice(0, 20);
  const dominant = topPeaks[0] ?? { freq: 0, amplitude: 0 };

  return {
    dominantFreq: dominant.freq,
    amplitude: dominant.amplitude,
    peaks: topPeaks,
    spectrum: fullSpectrum,
    freqResolution,
  };
}
