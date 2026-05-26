import { Box, Button, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useSensorWindows } from "../../hooks/useSensorWindows";
import { useDevice } from "../../hooks/useDevices";
import type { SensorWindow } from "../../types/sensorWindow.types";
import { SensorWindowFilters } from "../../components/sensor-windows/SensorWindowFilters";
import { SummaryCards } from "../../components/sensor-windows/SummaryCards";
import { RmsTrendChart } from "../../components/sensor-windows/RmsTrendChart";
import type { ChartPoint } from "../../components/sensor-windows/RmsTrendChart";
import { SensorWindowsTable } from "../../components/sensor-windows/SensorWindowsTable";
import type { WindowRow } from "../../components/sensor-windows/SensorWindowsTable";

type ParsedSample = { x: number; y: number; z: number };

const BUCKET_MINUTES = 10;
const RANGE_LIMIT = 2000;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeSample = (sample: unknown): ParsedSample | null => {
  if (!sample) return null;
  if (Array.isArray(sample) && sample.length >= 3) {
    const x = toNumber(sample[0]);
    const y = toNumber(sample[1]);
    const z = toNumber(sample[2]);
    if (x == null || y == null || z == null) return null;
    return { x, y, z };
  }
  if (typeof sample === "object") {
    const s = sample as Record<string, unknown>;
    const x = toNumber(s.x);
    const y = toNumber(s.y);
    const z = toNumber(s.z);
    if (x == null || y == null || z == null) return null;
    return { x, y, z };
  }
  return null;
};

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// ── Single-pass data processing ──────────────────────────────────────────────

interface ProcessedData {
  perWindow: WindowRow[];
  chartData: ChartPoint[];
  maxRms: number;
  dominantAxis: string;
  dominantAxisPct: number;
  coverageHours: number;
}

function processSensorData(windows: SensorWindow[]): ProcessedData {
  const perWindow: WindowRow[] = [];
  let totalRmsMax = 0;
  let domX = 0;
  let domY = 0;
  let domZ = 0;

  const BUCKET_MS = BUCKET_MINUTES * 60 * 1000;
  const buckets = new Map<
    number,
    { sumX: number; sumY: number; sumZ: number; count: number }
  >();

  for (const w of windows) {
    const samples: ParsedSample[] = [];
    for (const raw of w.samples) {
      const parsed = normalizeSample(raw);
      if (parsed) samples.push(parsed);
    }
    if (samples.length === 0) continue;

    // AC RMS (mean-removed RMS = stddev)
    let sx = 0, sy = 0, sz = 0;
    for (const s of samples) { sx += s.x; sy += s.y; sz += s.z; }
    const mx = sx / samples.length;
    const my = sy / samples.length;
    const mz = sz / samples.length;

    let sqx = 0, sqy = 0, sqz = 0;
    for (const s of samples) {
      const dx = s.x - mx; sqx += dx * dx;
      const dy = s.y - my; sqy += dy * dy;
      const dz = s.z - mz; sqz += dz * dz;
    }

    const rmsX = Math.sqrt(sqx / samples.length);
    const rmsY = Math.sqrt(sqy / samples.length);
    const rmsZ = Math.sqrt(sqz / samples.length);

    totalRmsMax = Math.max(totalRmsMax, rmsX, rmsY, rmsZ);
    if (rmsX >= rmsY && rmsX >= rmsZ) domX++;
    else if (rmsY >= rmsX && rmsY >= rmsZ) domY++;
    else domZ++;

    const time = new Date(w.recordedAt).getTime();
    perWindow.push({ id: w.id, recordedAt: w.recordedAt, rmsX, rmsY, rmsZ });

    // Bucket
    const key = Math.floor(time / BUCKET_MS) * BUCKET_MS;
    const b = buckets.get(key) ?? { sumX: 0, sumY: 0, sumZ: 0, count: 0 };
    b.sumX += rmsX; b.sumY += rmsY; b.sumZ += rmsZ; b.count += 1;
    buckets.set(key, b);
  }

  // Chart data from buckets
  const chartData: ChartPoint[] = Array.from(buckets.entries())
    .map(([time, b]) => ({
      time,
      rmsX: b.sumX / b.count,
      rmsY: b.sumY / b.count,
      rmsZ: b.sumZ / b.count,
    }))
    .sort((a, b) => a.time - b.time);

  // Coverage
  const times = perWindow.map((w) => new Date(w.recordedAt).getTime());
  const coverageHours =
    times.length > 1
      ? (Math.max(...times) - Math.min(...times)) / 3_600_000
      : 0;

  // Dominant axis
  const domTotal = domX + domY + domZ;
  let dominantAxis = "x";
  let dominantAxisPct = 0;
  if (domTotal > 0) {
    if (domX >= domY && domX >= domZ) {
      dominantAxis = "x";
      dominantAxisPct = Math.round((domX / domTotal) * 100);
    } else if (domY >= domX && domY >= domZ) {
      dominantAxis = "y";
      dominantAxisPct = Math.round((domY / domTotal) * 100);
    } else {
      dominantAxis = "z";
      dominantAxisPct = Math.round((domZ / domTotal) * 100);
    }
  }

  return {
    perWindow,
    chartData,
    maxRms: totalRmsMax,
    dominantAxis,
    dominantAxisPct,
    coverageHours,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function SensorWindowsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const id = Number(deviceId);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [visibleAxes, setVisibleAxes] = useState<Set<string>>(
    new Set(["rmsX", "rmsY", "rmsZ"]),
  );

  const { data: device } = useDevice(id);
  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useSensorWindows({
      deviceId: id,
      ...appliedFilters,
      limit: RANGE_LIMIT,
    });

  // Initialize 24h range on mount only (no re-runs).
  const applyRange = useCallback((hours: number) => {
    const now = new Date();
    const fromDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const nextFrom = formatDateTimeLocal(fromDate);
    const nextTo = formatDateTimeLocal(now);
    setFrom(nextFrom);
    setTo(nextTo);
    setAppliedFilters({ from: nextFrom, to: nextTo });
  }, []);

  useEffect(() => {
    applyRange(24);
  }, [applyRange]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...(from && { from }),
      ...(to && { to }),
    });
  };

  const handleResetFilters = () => {
    applyRange(24);
  };

  const handleRangePreset = (hours: number) => {
    applyRange(hours);
  };

  const handleToggleAxis = (axis: string) => {
    setVisibleAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axis)) next.delete(axis);
      else next.add(axis);
      return next;
    });
  };

  const hasFilters = !!appliedFilters.from || !!appliedFilters.to;

  // Single-pass processing: per-window RMS, bucketed chart, summary
  const processed = useMemo<ProcessedData>(() => {
    if (!data?.data || data.data.length === 0) {
      return {
        perWindow: [],
        chartData: [],
        maxRms: 0,
        dominantAxis: "",
        dominantAxisPct: 0,
        coverageHours: 0,
      };
    }
    return processSensorData(data.data);
  }, [data]);

  return (
    <Box p={6}>
      {/* Header */}
      <HStack mb={6} gap={3}>
        <Button size="sm" variant="ghost" onClick={() => navigate("/devices")}>
          ← Back
        </Button>
        <Heading size="lg">
          Sensor Data
          {device && (
            <Text
              as="span"
              color="gray.500"
              fontWeight="normal"
              fontSize="md"
              ml={2}
            >
              — {device.name}
            </Text>
          )}
        </Heading>
      </HStack>

      {/* Filters */}
      <Stack mb={6} gap={4}>
        <SensorWindowFilters
          from={from}
          to={to}
          hasFilters={hasFilters}
          onFromChange={setFrom}
          onToChange={setTo}
          onApply={handleApplyFilters}
          onClear={handleResetFilters}
          onRangePreset={handleRangePreset}
        />
      </Stack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load sensor data. Please try again.
        </Box>
      )}

      {/* Summary cards */}
      <Box mb={6}>
        {data && (
          <SummaryCards
            totalWindows={processed.perWindow.length}
            maxRms={processed.maxRms}
            dominantAxis={processed.dominantAxis}
            dominantAxisPct={processed.dominantAxisPct}
            coverageHours={processed.coverageHours}
            isLoading={isLoading}
          />
        )}
      </Box>

      {/* Chart */}
      <Box mb={6}>
        <RmsTrendChart
          data={processed.chartData}
          visibleAxes={visibleAxes}
          onToggleAxis={handleToggleAxis}
          isLoading={isLoading}
        />
      </Box>

      {/* Table */}
      {data && (
        <SensorWindowsTable
          windows={processed.perWindow}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPrevPage={prevPage}
          onNextPage={nextPage}
        />
      )}
    </Box>
  );
}
