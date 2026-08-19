import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { sensorWindowsApi } from "../../api/endpoints/sensorWindows.api";
import type { SensorWindow } from "../../types/sensorWindow.types";
import { StatCard } from "../../components/sensor-windows/StatCard";
import { AxisBlock } from "../../components/sensor-windows/AxisBlock";
import { MapCard } from "../../components/sensor-windows/MapCard";
import { IoMdArrowBack } from "react-icons/io";

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

  const analysis = data?.analysis;
  const dominantAxis = analysis
    ? (([ "y", "z"] as const).reduce((a, b) =>
        analysis.rms[a] >= analysis.rms[b] ? a : b,
      ) as  | "y" | "z")
    : null;

  return (
    <Box p={6}>
      {/* Header */}
      <HStack mb={6} gap={4}>
        <IconButton size="sm" variant="ghost" onClick={() => navigate(-1)}>
          <IoMdArrowBack />
        </IconButton>
        <Box>
          <Heading size="lg">Notification detail </Heading>
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
          {/* <StatCard
            label="Windows"
            value={windowCount ?? "—"}
            accent="teal.400"
            isLoading={isLoading}
          /> */}
          {/* <StatCard
            label="Dominant Axis"
            value={dominantAxis ? dominantAxis.toUpperCase() : "—"}
            accent="orange.400"
            isLoading={isLoading}
          /> */}
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
          ) : analysis ? (
            <HStack justifyContent={"space-between"} >
              {([ "y", "z"] as const).map((axis) => (
                <AxisBlock
                  key={axis}
                  axis={axis}
                  rms={analysis.rms[axis]}
                  p2p={analysis.peakToPeak[axis]}
                  isDominant={dominantAxis === axis}
                />
              ))}
            </HStack>
          ) : (
            <Text color="gray.400" fontSize="sm">
              No analysis available for this window
            </Text>
          )}
        </Box>

        {/* Frequency analysis */}
        {/* <Box
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
            Frequency Analysis
          </Text>
          {isLoading ? (
            <Skeleton h="120px" rounded="lg" />
          ) : analysis?.fft && analysis.fft.peaks.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <StatCard
                label="Dominant Frequency"
                value={`${analysis.fft.dominantFreq.toFixed(1)} Hz`}
                accent="blue.400"
                isLoading={false}
              />
              <StatCard
                label="Amplitude"
                value={analysis.fft.amplitude.toFixed(4)}
                accent="green.400"
                isLoading={false}
              />
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium" mb={2}>
                  Top Peaks
                </Text>
                <Stack gap={1}>
                  {analysis.fft.peaks.slice(0, 5).map((peak, i) => (
                    <HStack key={i} justify="space-between">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" fontFamily="mono">
                        {peak.freq.toFixed(1)} Hz
                      </Text>
                      <Text fontSize="sm" color="gray.500" fontFamily="mono">
                        {peak.amplitude.toFixed(4)}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>
            </SimpleGrid>
          ) : (
            <Text color="gray.400" fontSize="sm">
              No FFT data available for this window
            </Text>
          )}
        </Box> */}
      </Stack>
    </Box>
  );
}