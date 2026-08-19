import { Box, HStack, Skeleton, Text } from "@chakra-ui/react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartPoint {
  time: number;
  rmsX: number;
  rmsY: number;
  rmsZ: number;
}

interface Props {
  data: ChartPoint[];
  visibleAxes: Set<string>;
  onToggleAxis: (axis: string) => void;
  isLoading: boolean;
}

const AXIS_CONFIG = [
  { key: "rmsX", label: "X", color: "#3B82F6" },
  { key: "rmsY", label: "Y", color: "#10B981" },
  { key: "rmsZ", label: "Z", color: "#F59E0B" },
] as const;

const formatAxisTime = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function RmsTrendChart({
  data,
  visibleAxes,
  onToggleAxis,
  isLoading,
}: Props) {
  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
      p={4}
    >
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          RMS Trend
        </Text>
        <HStack gap={3}>
          {AXIS_CONFIG.map(({ key, label, color }) => (
            <HStack
              key={key}
              gap={1}
              cursor="pointer"
              opacity={visibleAxes.has(key) ? 1 : 0.35}
              onClick={() => onToggleAxis(key)}
            >
              <Box w="8px" h="8px" rounded="full" bg={color} />
              <Text
                fontSize="xs"
                fontWeight="medium"
                color="gray.600"
                userSelect="none"
              >
                {label}
              </Text>
            </HStack>
          ))}
        </HStack>
      </HStack>

      {isLoading ? (
        <Skeleton height="380px" rounded="lg" />
      ) : data.length === 0 ? (
        <Box height="380px" display="flex" alignItems="center" justifyContent="center" color="gray.400">
          No metric data found
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={formatAxisTime}
              tick={{ fontSize: 11 }}
              tickCount={8}
              minTickGap={60}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "m/s\u00B2",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fontSize: 11, fill: "#888" },
              }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(Number(label)).toISOString()}
              formatter={(value, name) => [
                `${Number(value).toFixed(4)} m/s\u00B2`,
                String(name).toUpperCase(),
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend
              formatter={(value) => String(value).toUpperCase()}
              wrapperStyle={{ fontSize: 13 }}
            />
            {AXIS_CONFIG.map(
              ({ key, color }) =>
                visibleAxes.has(key) && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                ),
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
