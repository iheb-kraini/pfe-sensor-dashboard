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

  const { data: device } = useDevice(id);
  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useSensorWindows({
      deviceId: id,
      ...appliedFilters,
    });

  // ── Build unified chart data ────────────────────────────────────────────────
  // Each data point: { time: number (ms epoch), x: number, y: number, z: number }
  // Missing samples default to 0.
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    const points: { time: number; x: number; y: number; z: number }[] = [];

    for (const window of data.data) {
      const windowStart = new Date(window.recordedAt).getTime();
      const msBetweenSamples = 1000 / SAMPLE_RATE_HZ; // 2ms per sample

      for (let i = 0; i < Math.max(window.samples.length, 1); i++) {
        const sample = window.samples[i];
        points.push({
          time: windowStart + i * msBetweenSamples,
          x: sample?.x ?? 0,
          y: sample?.y ?? 0,
          z: sample?.z ?? 0,
        });
      }
    }

    // Sort chronologically in case windows are out of order
    points.sort((a, b) => a.time - b.time);

    return points;
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
          <Badge colorPalette="gray">{chartData.length} samples total</Badge>
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
                  value: "m/s²",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fontSize: 11, fill: "#888" },
                }}
              />
              <Tooltip
                labelFormatter={(label) => formatTooltipTime(Number(label))}
                formatter={(value, name) => [
                  `${Number(value).toFixed(4)} m/s²`,
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
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="z"
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
