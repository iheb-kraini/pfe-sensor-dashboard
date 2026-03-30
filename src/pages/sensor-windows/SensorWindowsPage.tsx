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
import { useState, useMemo, useEffect, useCallback } from "react";
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

type ParsedSample = { x: number; y: number; z: number };

const BUCKET_MINUTES = 2;
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

  let sumSqX = 0;
  let sumSqY = 0;
  let sumSqZ = 0;

  for (const s of samples) {
    const dx = s.x - meanX;
    const dy = s.y - meanY;
    const dz = s.z - meanZ;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
    sumSqZ += dz * dz;
  }

  const rmsX = Math.sqrt(sumSqX / samples.length);
  const rmsY = Math.sqrt(sumSqY / samples.length);
  const rmsZ = Math.sqrt(sumSqZ / samples.length);

  return { rmsX, rmsY, rmsZ };
};

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function SensorWindowsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const id = Number(deviceId);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rangeHours, setRangeHours] = useState<12 | 24>(24);
  const [appliedFilters, setAppliedFilters] = useState<{
    from?: string;
    to?: string;
  }>({});

  const { data: device } = useDevice(id);
  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useSensorWindows({
      deviceId: id,
      ...appliedFilters,
      limit: RANGE_LIMIT,
    });

  // Build 2-minute RMS-per-axis buckets for trend view.
  const metricsData = useMemo(() => {
    if (!data?.data) return [];

    const buckets = new Map<
      number,
      { rmsXSum: number; rmsYSum: number; rmsZSum: number; count: number }
    >();

    for (const window of data.data) {
      const parsedSamples = window.samples
        .map((sample) => normalizeSample(sample))
        .filter((sample): sample is ParsedSample => sample !== null);

      const metrics = computeWindowMetrics(parsedSamples);
      if (!metrics) continue;

      const bucketDate = new Date(window.recordedAt);
      const bucketMinute =
        Math.floor(bucketDate.getMinutes() / BUCKET_MINUTES) * BUCKET_MINUTES;
      bucketDate.setMinutes(bucketMinute, 0, 0);
      const key = bucketDate.getTime();

      const bucket = buckets.get(key) ?? {
        rmsXSum: 0,
        rmsYSum: 0,
        rmsZSum: 0,
        count: 0,
      };
      bucket.rmsXSum += metrics.rmsX;
      bucket.rmsYSum += metrics.rmsY;
      bucket.rmsZSum += metrics.rmsZ;
      bucket.count += 1;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries())
      .map(([time, bucket]) => ({
        time,
        rmsX: bucket.rmsXSum / bucket.count,
        rmsY: bucket.rmsYSum / bucket.count,
        rmsZ: bucket.rmsZSum / bucket.count,
        count: bucket.count,
      }))
      .sort((a, b) => a.time - b.time);
  }, [data]);

  const formatBucketTime = (ms: number) => {
    const d = new Date(ms);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${month}/${day} ${hour}:${minute}`;
  };

  const formatTooltipTime = (ms: number) => new Date(ms).toISOString();

  const applyRange = useCallback((hours: 12 | 24) => {
    const now = new Date();
    const fromDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const nextFrom = formatDateTimeLocal(fromDate);
    const nextTo = formatDateTimeLocal(now);
    setFrom(nextFrom);
    setTo(nextTo);
    setAppliedFilters({
      from: nextFrom,
      to: nextTo,
    });
  }, []);

  useEffect(() => {
    applyRange(rangeHours);
  }, [applyRange, rangeHours]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...(from && { from }),
      ...(to && { to }),
    });
  };

  const handleResetFilters = () => {
    applyRange(rangeHours);
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
          <Badge colorPalette="gray">
            {metricsData.length} buckets ({BUCKET_MINUTES}-min, last{" "}
            {rangeHours}h)
          </Badge>
        </HStack>
      )}

      {data && (
        <HStack mb={4} gap={2} flexWrap="wrap">
          <Text fontSize="sm" color="gray.500">
            Range
          </Text>
          <Button
            size="xs"
            variant={rangeHours === 24 ? "solid" : "outline"}
            colorPalette="blue"
            onClick={() => setRangeHours(24)}
          >
            24h
          </Button>
          <Button
            size="xs"
            variant={rangeHours === 12 ? "solid" : "outline"}
            onClick={() => setRangeHours(12)}
          >
            12h
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
        ) : metricsData.length === 0 ? (
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
                tickFormatter={formatBucketTime}
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
              <Line
                type="monotone"
                dataKey="rmsX"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="rmsY"
                stroke="#10B981"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="rmsZ"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
