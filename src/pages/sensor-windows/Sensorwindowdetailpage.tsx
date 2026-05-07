import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { sensorWindowsApi } from "../../api/endpoints/sensorWindows.api";
import { computeMetrics } from "../../utils/sensorMetrics";
import type { SensorWindow } from "../../types/sensorWindow.types";

// ── Small stat card ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  accent,
  isLoading,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent: string;
  isLoading: boolean;
}) {
  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} w="4px" h="full" bg={accent} />
      <Text
        fontSize="xs"
        color="gray.400"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={2}
      >
        {label}
      </Text>
      {isLoading ? (
        <Skeleton h="28px" w="80px" rounded="md" />
      ) : (
        <HStack align="baseline" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </Text>
          {unit && (
            <Text fontSize="sm" color="gray.400">
              {unit}
            </Text>
          )}
        </HStack>
      )}
    </Box>
  );
}

// ── Axis metrics block ────────────────────────────────────────────────────────

function AxisBlock({
  axis,
  rms,
  p2p,
  min,
  max,
  isDominant,
}: {
  axis: string;
  rms: number;
  p2p: number;
  min: number;
  max: number;
  isDominant: boolean;
}) {
  return (
    <Box
      bg={isDominant ? "orange.50" : "gray.50"}
      rounded="lg"
      p={4}
      borderWidth="1px"
      borderColor={isDominant ? "orange.200" : "gray.100"}
    >
      <HStack mb={3} justify="space-between">
        <Text
          fontWeight="bold"
          fontSize="lg"
          color="gray.700"
          textTransform="uppercase"
        >
          {axis}-axis
        </Text>
        {isDominant && (
          <Badge colorPalette="orange" size="sm">
            Dominant
          </Badge>
        )}
      </HStack>
      <Grid templateColumns="1fr 1fr" gap={3}>
        {[
          { label: "RMS", value: rms.toFixed(4) },
          { label: "P2P", value: p2p.toFixed(4) },
          { label: "Min", value: min.toFixed(4) },
          { label: "Max", value: max.toFixed(4) },
        ].map(({ label, value }) => (
          <Box key={label}>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              {label}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.700"
              fontFamily="mono"
            >
              {value}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}

// ── Map card ──────────────────────────────────────────────────────────────────

function MapCard({
  lat,
  lon,
  isLoading,
}: {
  lat: number | null;
  lon: number | null;
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton h="220px" rounded="xl" />;

  if (!lat || !lon) {
    return (
      <Box
        bg="white"
        rounded="xl"
        p={5}
        borderWidth="1px"
        borderColor="gray.100"
        shadow="sm"
        textAlign="center"
      >
        <Text fontSize="2xl" mb={2}>
          📍
        </Text>
        <Text color="gray.400" fontSize="sm">
          No GPS fix
        </Text>
      </Box>
    );
  }
  const latNum = Number(lat);
  const lonNum = Number(lon);

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lonNum - 0.01},${latNum - 0.01},${lonNum + 0.01},${latNum + 0.01}&layer=mapnik&marker=${latNum},${lonNum}`;

  return (
    <Box
      bg="white"
      rounded="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
    >
      <Box px={5} pt={4} pb={2}>
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Location
        </Text>
        <Text fontSize="sm" color="gray.600" fontFamily="mono" mt={1}>
          {latNum.toFixed(6)}, {lonNum.toFixed(6)}
        </Text>
      </Box>
      <iframe
        src={src}
        width="100%"
        height="220px"
        style={{ border: "none", display: "block" }}
      />{" "}
    </Box>
  );
}

// ── Raw samples ───────────────────────────────────────────────────────────────

function SamplesCard({
  samples,
  isLoading,
}: {
  samples: SensorWindow["samples"];
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? samples : samples.slice(0, 10);

  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
    >
      <HStack justify="space-between" mb={3}>
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Raw Samples ({samples.length})
        </Text>
        {samples.length > 10 && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="blue"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Show less" : `Show all ${samples.length}`}
          </Button>
        )}
      </HStack>
      {isLoading ? (
        <Skeleton h="120px" rounded="md" />
      ) : (
        <Box
          bg="gray.50"
          rounded="md"
          p={3}
          fontSize="xs"
          fontFamily="mono"
          color="gray.600"
          maxH={expanded ? "400px" : "220px"}
          overflowY="auto"
        >
          <Grid templateColumns="40px 1fr 1fr 1fr" gap={1} mb={1}>
            {["#", "X", "Y", "Z"].map((h) => (
              <Text key={h} fontWeight="bold" color="gray.400">
                {h}
              </Text>
            ))}
          </Grid>
          {visible.map((s, i) => (
            <Grid key={i} templateColumns="40px 1fr 1fr 1fr" gap={1}>
              <Text color="gray.300">{i + 1}</Text>
              <Text>{s.x.toFixed(4)}</Text>
              <Text>{s.y.toFixed(4)}</Text>
              <Text>{s.z.toFixed(4)}</Text>
            </Grid>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
            value={data?.speedKmph ?? "—"}
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

        {/* Raw samples */}
        {data && <SamplesCard samples={data.samples} isLoading={isLoading} />}
      </Stack>
    </Box>
  );
}
