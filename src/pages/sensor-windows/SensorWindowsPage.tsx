import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  Text,
  Input,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useSensorWindows } from "../../hooks/useSensorWindows";
import { useDevice } from "../../hooks/useDevices";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SAMPLE_RATE_HZ = 500;

type ParsedSample = { x: number; y: number; z: number };

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

const computeWindowMetrics = (samples: ParsedSample[]) => {
  if (samples.length === 0) return null;

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const s of samples) {
    sumX += s.x;
    sumY += s.y;
    sumZ += s.z;
  }
  const meanX = sumX / samples.length;
  const meanY = sumY / samples.length;
  const meanZ = sumZ / samples.length;

  let sumMagSq = 0;
  let minMag = Number.POSITIVE_INFINITY;
  let maxMag = Number.NEGATIVE_INFINITY;

  for (const s of samples) {
    const dx = s.x - meanX;
    const dy = s.y - meanY;
    const dz = s.z - meanZ;
    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
    sumMagSq += mag * mag;
    if (mag < minMag) minMag = mag;
    if (mag > maxMag) maxMag = mag;
  }

  const rms = Math.sqrt(sumMagSq / samples.length);
  const p2p = maxMag - minMag;

  return { rms, p2p };
};

export function SensorWindowsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const id = Number(deviceId);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [chartMode, setChartMode] = useState<"metrics" | "raw">("metrics");
  const [appliedFilters, setAppliedFilters] = useState<{
    from?: string;
    to?: string;
  }>({});

  const { data: device } = useDevice(id);
  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useSensorWindows({
      deviceId: id,
      ...appliedFilters,
    });

  // ── Build unified chart data ────────────────────────────────────────────────
  // Each data point: { time: number (ms epoch), x: number | null, y: number | null, z: number | null }
  // Missing samples default to null so gaps don't connect.
  const MAX_WINDOWS = 10;
  const MAX_TOTAL_POINTS = 1000;

  const chartData = useMemo(() => {
    if (!data?.data) return [];

    // cap to most recent MAX_WINDOWS windows
    const windows = data.data.slice(-MAX_WINDOWS);

    const points: {
      time: number;
      x: number | null;
      y: number | null;
      z: number | null;
    }[] = [];
    let validCount = 0;

    for (let w = 0; w < windows.length; w++) {
      const window = windows[w];
      const windowStart = new Date(window.recordedAt).getTime();
      const msBetweenSamples = 1000 / SAMPLE_RATE_HZ;

      for (let i = 0; i < window.samples.length; i++) {
        const sample = normalizeSample(window.samples[i]);
        if (sample) validCount += 1;
        points.push({
          time: windowStart + i * msBetweenSamples,
          x: sample?.x ?? null,
          y: sample?.y ?? null,
          z: sample?.z ?? null,
        });
      }

      if (w < windows.length - 1) {
        points.push({
          time: windowStart + window.samples.length * msBetweenSamples + 1,
          x: null,
          y: null,
          z: null,
        });
      }
    }

    points.sort((a, b) => a.time - b.time);

    if (validCount === 0) return [];

    // downsample — keep every Nth point so total stays under MAX_TOTAL_POINTS
    if (points.length > MAX_TOTAL_POINTS) {
      const step = Math.ceil(points.length / MAX_TOTAL_POINTS);
      return points.filter((_, i) => i % step === 0);
    }

    return points;
  }, [data]);

  const metricsData = useMemo(() => {
    if (!data?.data) return [];

    const buckets = new Map<
      number,
      { rmsSum: number; p2pSum: number; count: number }
    >();

    for (const window of data.data) {
      const parsedSamples = window.samples
        .map((sample) => normalizeSample(sample))
        .filter((sample): sample is ParsedSample => sample !== null);

      const metrics = computeWindowMetrics(parsedSamples);
      if (!metrics) continue;

      const bucketDate = new Date(window.recordedAt);
      bucketDate.setMinutes(0, 0, 0);
      const key = bucketDate.getTime();

      const bucket = buckets.get(key) ?? { rmsSum: 0, p2pSum: 0, count: 0 };
      bucket.rmsSum += metrics.rms;
      bucket.p2pSum += metrics.p2p;
      bucket.count += 1;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries())
      .map(([time, bucket]) => ({
        time,
        rms: bucket.rmsSum / bucket.count,
        p2p: bucket.p2pSum / bucket.count,
        count: bucket.count,
      }))
      .sort((a, b) => a.time - b.time);
  }, [data]);

  const rawSampleCount = useMemo(() => {
    if (!data?.data) return 0;
    return data.data.reduce((sum, window) => sum + window.samples.length, 0);
  }, [data]);
  // ── X-axis tick formatter ───────────────────────────────────────────────────
  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(
        2,
        "0",
      )}:${d.getSeconds().toString().padStart(2, "0")}.${Math.floor(
      d.getMilliseconds() / 10,
    )
      .toString()
      .padStart(2, "0")}`;
  };

  const formatHour = (ms: number) => {
    const d = new Date(ms);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    return `${month}/${day} ${hour}:00`;
  };

  const formatTooltipTime = (ms: number) => new Date(ms).toISOString();

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...(from && { from }),
      ...(to && { to }),
    });
  };

  const handleResetFilters = () => {
    setFrom("");
    setTo("");
    setAppliedFilters({});
  };

  const hasFilters = !!appliedFilters.from || !!appliedFilters.to;

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
      <HStack mb={6} gap={3} flexWrap="wrap">
        <Stack gap={1}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            From
          </Text>
          <Input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            maxW="220px"
            size="sm"
          />
        </Stack>
        <Stack gap={1}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            To
          </Text>
          <Input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            maxW="220px"
            size="sm"
          />
        </Stack>
        <Button
          size="sm"
          colorPalette="blue"
          alignSelf="flex-end"
          onClick={handleApplyFilters}
        >
          Apply
        </Button>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            alignSelf="flex-end"
            onClick={handleResetFilters}
          >
            Clear
          </Button>
        )}
      </HStack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load sensor data. Please try again.
        </Box>
      )}

      {/* Summary badges */}
      {data && (
        <HStack mb={4} gap={3} flexWrap="wrap">
          <Badge colorPalette="blue">{data.data.length} windows</Badge>
          {chartMode === "raw" ? (
            <Badge colorPalette="gray">{rawSampleCount} samples total</Badge>
          ) : (
            <Badge colorPalette="gray">{metricsData.length} hours</Badge>
          )}
        </HStack>
      )}

      {data && (
        <HStack mb={4} gap={2} flexWrap="wrap">
          <Text fontSize="sm" color="gray.500">
            View
          </Text>
          <Button
            size="xs"
            variant={chartMode === "metrics" ? "solid" : "outline"}
            colorPalette="blue"
            onClick={() => setChartMode("metrics")}
          >
            Hourly RMS/P2P
          </Button>
          <Button
            size="xs"
            variant={chartMode === "raw" ? "solid" : "outline"}
            onClick={() => setChartMode("raw")}
          >
            Raw waveform
          </Button>
        </HStack>
      )}

      {/* Chart */}
      <Box
        bg="white"
        rounded="lg"
        shadow="sm"
        border="1px solid"
        borderColor="gray.200"
        p={4}
        mb={6}
      >
        {isLoading ? (
          <Box textAlign="center" py={16} color="gray.400">
            Loading...
          </Box>
        ) : (
          <>
            {chartMode === "metrics" ? (
              metricsData.length === 0 ? (
                <Box textAlign="center" py={16} color="gray.400">
                  No metric data found
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={metricsData}
                    margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      scale="time"
                      tickFormatter={formatHour}
                      tick={{ fontSize: 11 }}
                      minTickGap={80}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "m/s^2",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: { fontSize: 11, fill: "#888" },
                      }}
                    />
                    <Tooltip
                      labelFormatter={(label) =>
                        formatTooltipTime(Number(label))
                      }
                      formatter={(value, name) => [
                        `${Number(value).toFixed(4)} m/s^2`,
                        String(name).toUpperCase(),
                      ]}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend
                      formatter={(value) => value.toUpperCase()}
                      wrapperStyle={{ fontSize: 13 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rms"
                      stroke="#3B82F6"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="p2p"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            ) : chartData.length === 0 ? (
              <Box textAlign="center" py={16} color="gray.400">
                No sensor data found
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    scale="time"
                    tickFormatter={formatTime}
                    tick={{ fontSize: 11 }}
                    minTickGap={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "m/s^2",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fontSize: 11, fill: "#888" },
                    }}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatTooltipTime(Number(label))}
                    formatter={(value, name) => [
                      `${Number(value).toFixed(4)} m/s^2`,
                      String(name).toUpperCase(),
                    ]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend
                    formatter={(value) => value.toUpperCase()}
                    wrapperStyle={{ fontSize: 13 }}
                  />
                  {/* dot={false} is critical for performance with 500+ points */}
                  <Line
                    type="monotone"
                    dataKey="x"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="z"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" mt={4} gap={2}>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={prevPage}
          >
            Previous
          </Button>
          <Text fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={nextPage}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
}
