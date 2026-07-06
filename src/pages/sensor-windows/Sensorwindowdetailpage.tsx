import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { sensorWindowsApi } from "../../api/endpoints/sensorWindows.api";
import { computeMetrics, computeFft } from "../../utils/sensorMetrics";
import type { SensorWindow } from "../../types/sensorWindow.types";
import { FftSpectrumChart } from "../../components/sensor-windows/FftSpectrumChart";
import { StatCard } from "../../components/sensor-windows/StatCard";
import { AxisBlock } from "../../components/sensor-windows/AxisBlock";
import { MapCard } from "../../components/sensor-windows/MapCard";

export function SensorWindowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<SensorWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    sensorWindowsApi
      .findOne(Number(id))
      .then(setData)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const metrics = data?.samples.length ? computeMetrics(data.samples) : null;
  const fft = data?.samples.length ? computeFft(data.samples) : null;

  return (
    <Box p={6}>
      {/* Header */}
      <HStack mb={6} gap={4}>
        <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Box>
          <Heading size="lg">Sensor Window #{id}</Heading>
          {data && (
            <Text color="gray.500" fontSize="sm" mt={0.5}>
              Recorded {new Date(data.recordedAt).toLocaleString()}
            </Text>
          )}
        </Box>
        {data && (
          <Badge colorPalette={data.gpsSynced ? "green" : "gray"} ml="auto">
            {data.gpsSynced ? "GPS Synced" : "No GPS Sync"}
          </Badge>
        )}
      </HStack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={6}>
          Failed to load sensor window. Please try again.
        </Box>
      )}

      <Stack gap={6}>
        {/* Top stat cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <StatCard
            label="Speed"
            value={data?.speedKmph != null ? Number(data.speedKmph).toFixed(2) : "—"}
            unit={data?.speedKmph != null ? "km/h" : undefined}
            accent="blue.400"
            isLoading={isLoading}
          />
          <StatCard
            label="Satellites"
            value={data?.satellites ?? "—"}
            accent="purple.400"
            isLoading={isLoading}
          />
          <StatCard
            label="Samples"
            value={data?.samples.length ?? "—"}
            accent="teal.400"
            isLoading={isLoading}
          />
          <StatCard
            label="Dominant Axis"
            value={metrics ? metrics.dominantAxis.toUpperCase() : "—"}
            accent="orange.400"
            isLoading={isLoading}
          />
        </SimpleGrid>

        {/* Map */}
        <MapCard
          lat={data?.lat ?? null}
          lon={data?.lon ?? null}
          isLoading={isLoading}
        />

        {/* Axis metrics */}
        <Box
          bg="white"
          rounded="xl"
          p={5}
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
        >
          <Text
            fontSize="xs"
            color="gray.400"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={4}
          >
            Vibration Metrics
          </Text>
          {isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} h="140px" rounded="lg" />
              ))}
            </SimpleGrid>
          ) : metrics ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              {(["x", "y", "z"] as const).map((axis) => (
                <AxisBlock
                  key={axis}
                  axis={axis}
                  {...metrics[axis]}
                  isDominant={metrics.dominantAxis === axis}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.400" fontSize="sm">
              No samples available
            </Text>
          )}
        </Box>

        {/* FFT Spectrum */}
        <Box>
          <FftSpectrumChart fft={fft} isLoading={isLoading} />
        </Box>
      </Stack>
    </Box>
  );
}
