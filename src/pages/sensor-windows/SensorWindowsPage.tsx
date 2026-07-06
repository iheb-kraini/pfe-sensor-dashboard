import { Box, Button, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useDevice, useActivateDevice, useDeactivateDevice, useRefreshApiKey } from "../../hooks/useDevices";
import { useSensorWindowAnalysis } from "../../hooks/useSensorWindowAnalysis";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "../../components/notifications/NotificationItem";
import { DeviceInfoCard } from "../../components/devices/DeviceInfoCard";

import { SensorWindowFilters } from "../../components/sensor-windows/SensorWindowFilters";
import { RmsTrendChart } from "../../components/sensor-windows/RmsTrendChart";
import type { ChartPoint } from "../../components/sensor-windows/RmsTrendChart";

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

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return formatDateTimeLocal(d);
  });
  const [rangeHours, setRangeHours] = useState(24);
  const [visibleAxes, setVisibleAxes] = useState<Set<string>>(
    new Set(["rmsX", "rmsY", "rmsZ"]),
  );

  const { data: device } = useDevice(id);

  const { mutate: activateDevice, isPending: isActivating } = useActivateDevice();
  const { mutate: deactivateDevice, isPending: isDeactivating } = useDeactivateDevice();
  const { mutate: refreshKey, isPending: isRefreshing } = useRefreshApiKey();

  const { notifications: deviceNotifications } = useNotifications({ deviceId: id, limit: 3 });

  const to = useMemo(() => {
    if (!from || !ISO_RE.test(from)) return "";
    const d = new Date(from);
    return formatDateTimeLocal(new Date(d.getTime() + rangeHours * 60 * 60 * 1000));
  }, [from, rangeHours]);

  const { allData, isLoading, isError } =
    useSensorWindowAnalysis({ deviceId: id, from, to });

  const handleToggleAxis = (axis: string) => {
    setVisibleAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axis)) next.delete(axis);
      else next.add(axis);
      return next;
    });
  };

  const handleToggleActive = () => {
    if (device?.isActive) {
      deactivateDevice(id);
    } else {
      activateDevice(id);
    }
  };

  const handleRefreshKey = () => {
    refreshKey(id);
  };


  const MAX_CHART_POINTS = 500;

  const chartData = useMemo<ChartPoint[]>(() => {
    const raw = allData.map((w) => ({
      time: new Date(w.recordedAt).getTime(),
      rmsX: w.analysis.rms.x,
      rmsY: w.analysis.rms.y,
      rmsZ: w.analysis.rms.z,
    }));
    if (raw.length <= MAX_CHART_POINTS) return raw;
    const step = Math.floor(raw.length / MAX_CHART_POINTS);
    return raw.filter((_, i) => i % step === 0);
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

      {device && (
        <Box mb={6}>
          <DeviceInfoCard
            device={device}
            isActivating={isActivating}
            isDeactivating={isDeactivating}
            isRefreshing={isRefreshing}
            onToggleActive={handleToggleActive}
            onRefreshKey={handleRefreshKey}
          />
        </Box>
      )}

      <Stack mb={6} gap={4}>
        <SensorWindowFilters
          from={from}
          rangeHours={rangeHours}
          onFromChange={setFrom}
          onRangeChange={setRangeHours}
        />
      </Stack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load sensor data. Please try again.
        </Box>
      )}

      <Box mb={6}>
        <RmsTrendChart
          data={chartData}
          visibleAxes={visibleAxes}
          onToggleAxis={handleToggleAxis}
          isLoading={isLoading}
        />
      </Box>

      {deviceNotifications.length > 0 && (
        <Box bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100" mb={6} overflow="hidden">
          <HStack justify="space-between" px={5} py={3} borderBottom="1px solid" borderColor="muted.100">
            <Text fontSize="sm" fontWeight="semibold" color="muted.700">
              Recent Notifications
            </Text>
            <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => navigate("/notifications")}>
              View all →
            </Button>
          </HStack>
          <VStack gap={0} align="stretch">
            {deviceNotifications.slice(0, 3).map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </VStack>
        </Box>
      )}

    </Box>
  );
}
