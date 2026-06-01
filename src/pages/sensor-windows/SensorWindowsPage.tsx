import { Box, Button, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useDevice } from "../../hooks/useDevices";
import { useSensorWindowAnalysis } from "../../hooks/useSensorWindowAnalysis";
import { SensorWindowFilters } from "../../components/sensor-windows/SensorWindowFilters";
import { SummaryCards } from "../../components/sensor-windows/SummaryCards";
import { RmsTrendChart } from "../../components/sensor-windows/RmsTrendChart";
import type { ChartPoint } from "../../components/sensor-windows/RmsTrendChart";
import { SensorWindowsTable } from "../../components/sensor-windows/SensorWindowsTable";
import type { WindowRow } from "../../components/sensor-windows/SensorWindowsTable";

const BUCKET_MINUTES = 10;
const PAGE_LIMIT = 20;

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function SensorWindowsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const id = Number(deviceId);

  const [from, setFrom] = useState("");
  const [rangeHours, setRangeHours] = useState(24);
  const [appliedFilters, setAppliedFilters] = useState<{
    from?: string;
    to?: string;
  }>({});
  const [visibleAxes, setVisibleAxes] = useState<Set<string>>(
    new Set(["rmsX", "rmsY", "rmsZ"]),
  );

  const { data: device } = useDevice(id);

  const to = useMemo(() => {
    if (!from || !ISO_RE.test(from)) return "";
    const d = new Date(from);
    return formatDateTimeLocal(new Date(d.getTime() + rangeHours * 60 * 60 * 1000));
  }, [from, rangeHours]);

  const { data, allData, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useSensorWindowAnalysis({ deviceId: id, ...appliedFilters, limit: PAGE_LIMIT });

  const applyRange = useCallback((hours: number) => {
    const now = new Date();
    const fromDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
    setFrom(formatDateTimeLocal(fromDate));
    setRangeHours(hours);
    setAppliedFilters({
      from: formatDateTimeLocal(fromDate),
      to: formatDateTimeLocal(now),
    });
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

  const handleRangeChange = (hours: number) => {
    setRangeHours(hours);
  };

  const handleToggleAxis = (axis: string) => {
    setVisibleAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axis)) next.delete(axis);
      else next.add(axis);
      return next;
    });
  };

  const hasFilters = !!appliedFilters.from;

  const perWindow = useMemo<WindowRow[]>(
    () =>
      data.map((w) => ({
        id: w.id,
        recordedAt: w.recordedAt,
        rmsX: w.analysis.rms.x,
        rmsY: w.analysis.rms.y,
        rmsZ: w.analysis.rms.z,
      })),
    [data],
  );

  const chartData = useMemo<ChartPoint[]>(() => {
    if (allData.length === 0) return [];
    const BUCKET_MS = BUCKET_MINUTES * 60 * 1000;
    const buckets = new Map<
      number,
      { sumX: number; sumY: number; sumZ: number; count: number }
    >();
    for (const w of allData) {
      const time = new Date(w.recordedAt).getTime();
      const key = Math.floor(time / BUCKET_MS) * BUCKET_MS;
      const b = buckets.get(key) ?? { sumX: 0, sumY: 0, sumZ: 0, count: 0 };
      b.sumX += w.analysis.rms.x;
      b.sumY += w.analysis.rms.y;
      b.sumZ += w.analysis.rms.z;
      b.count += 1;
      buckets.set(key, b);
    }
    return Array.from(buckets.entries())
      .map(([time, b]) => ({
        time,
        rmsX: b.sumX / b.count,
        rmsY: b.sumY / b.count,
        rmsZ: b.sumZ / b.count,
      }))
      .sort((a, b) => a.time - b.time);
  }, [allData]);

  const maxRms = useMemo(() => {
    let max = 0;
    for (const w of allData) {
      const { x, y, z } = w.analysis.rms;
      max = Math.max(max, x, y, z);
    }
    return max;
  }, [allData]);

  const dominant = useMemo(() => {
    let domX = 0, domY = 0, domZ = 0;
    for (const w of allData) {
      const { x, y, z } = w.analysis.rms;
      if (x >= y && x >= z) domX++;
      else if (y >= x && y >= z) domY++;
      else domZ++;
    }
    const total = domX + domY + domZ;
    if (total === 0) return { axis: "", pct: 0 };
    if (domX >= domY && domX >= domZ) return { axis: "x", pct: Math.round((domX / total) * 100) };
    if (domY >= domX && domY >= domZ) return { axis: "y", pct: Math.round((domY / total) * 100) };
    return { axis: "z", pct: Math.round((domZ / total) * 100) };
  }, [allData]);

  const coverageHours = useMemo(() => {
    if (allData.length < 2) return 0;
    const times = allData.map((w) => new Date(w.recordedAt).getTime());
    return (Math.max(...times) - Math.min(...times)) / 3_600_000;
  }, [allData]);

  return (
    <Box p={6}>
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

      <Stack mb={6} gap={4}>
        <SensorWindowFilters
          from={from}
          rangeHours={rangeHours}
          hasFilters={hasFilters}
          onFromChange={setFrom}
          onRangeChange={handleRangeChange}
          onApply={handleApplyFilters}
          onClear={handleResetFilters}
        />
      </Stack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load sensor data. Please try again.
        </Box>
      )}

      <Box mb={6}>
        {allData.length > 0 && (
          <SummaryCards
            totalWindows={perWindow.length}
            maxRms={maxRms}
            dominantAxis={dominant.axis}
            dominantAxisPct={dominant.pct}
            coverageHours={coverageHours}
            isLoading={isLoading}
          />
        )}
      </Box>

      <Box mb={6}>
        <RmsTrendChart
          data={chartData}
          visibleAxes={visibleAxes}
          onToggleAxis={handleToggleAxis}
          isLoading={isLoading}
        />
      </Box>

      {allData.length > 0 && (
        <SensorWindowsTable
          windows={perWindow}
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
