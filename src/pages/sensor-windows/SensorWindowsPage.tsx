import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  Table,
  Text,
  Input,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSensorWindows } from "../../hooks/useSensorWindows";
import { useDevice } from "../../hooks/useDevices";

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
      <HStack mb={4} gap={3} flexWrap="wrap">
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

      <Table.Root variant="outline" rounded="md">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Recorded At</Table.ColumnHeader>
            <Table.ColumnHeader>GPS Synced</Table.ColumnHeader>
            <Table.ColumnHeader>Lat</Table.ColumnHeader>
            <Table.ColumnHeader>Lon</Table.ColumnHeader>
            <Table.ColumnHeader>Speed (km/h)</Table.ColumnHeader>
            <Table.ColumnHeader>Satellites</Table.ColumnHeader>
            <Table.ColumnHeader>Samples</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              <Table.Cell
                colSpan={7}
                textAlign="center"
                py={8}
                color="gray.400"
              >
                Loading...
              </Table.Cell>
            </Table.Row>
          ) : data?.data.length === 0 ? (
            <Table.Row>
              <Table.Cell
                colSpan={7}
                textAlign="center"
                py={8}
                color="gray.400"
              >
                No sensor data found
              </Table.Cell>
            </Table.Row>
          ) : (
            data?.data.map((window) => (
              <Table.Row key={window.id}>
                <Table.Cell fontSize="sm">
                  {new Date(window.recordedAt).toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={window.gpsSynced ? "green" : "gray"}>
                    {window.gpsSynced ? "Synced" : "No GPS"}
                  </Badge>
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {window.lat ?? "—"}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {window.lon ?? "—"}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {window.speedKmph ?? "—"}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {window.satellites ?? "—"}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {window.samples.length} samples
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

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
