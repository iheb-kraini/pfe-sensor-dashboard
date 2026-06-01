import { Box, Skeleton, Text } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VibrationAnalysis } from "../../types/sensorWindow.types";

interface Props {
  fft: VibrationAnalysis["fft"] | null;
  isLoading: boolean;
}

export function FftSpectrumChart({ fft, isLoading }: Props) {
  const chartData = fft?.peaks.map((p) => ({
    freq: p.freq,
    amp: p.amplitude,
    isDominant: p.freq === fft.dominantFreq,
  })) ?? [];

  return (
    <Box bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.200" p={4}>
      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
        FFT Spectrum
        {fft && (
          <Text as="span" fontSize="xs" color="muted.400" fontWeight="normal" ml={2}>
            — Dominant: {fft.dominantFreq.toFixed(1)} Hz
          </Text>
        )}
      </Text>

      {isLoading ? (
        <Skeleton height="200px" rounded="lg" />
      ) : chartData.length === 0 ? (
        <Box textAlign="center" py={10} color="gray.400" fontSize="sm">
          No FFT data available
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="freq"
              tick={{ fontSize: 11 }}
              label={{ value: "Hz", position: "insideBottomRight", offset: -4, style: { fontSize: 10, fill: "#888" } }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{ value: "g", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 10, fill: "#888" } }}
            />
            <Tooltip
              formatter={(value) => [Number(value).toFixed(3), "Amplitude"]}
              labelFormatter={(label) => `${Number(label).toFixed(1)} Hz`}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar
              dataKey="amp"
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
