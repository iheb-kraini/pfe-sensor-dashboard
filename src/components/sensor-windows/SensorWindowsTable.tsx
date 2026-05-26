import { Badge, Box, Button, HStack, Table, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export interface WindowRow {
  id: number;
  recordedAt: string;
  rmsX: number;
  rmsY: number;
  rmsZ: number;
}

interface Props {
  windows: WindowRow[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

function getSeverityLabel(rmsX: number, rmsY: number, rmsZ: number) {
  const maxRms = Math.max(rmsX, rmsY, rmsZ);
  if (maxRms > 2.0) return { label: "High", palette: "red" as const };
  if (maxRms > 1.0) return { label: "Medium", palette: "orange" as const };
  return { label: "Normal", palette: "green" as const };
}

function WindowCard({
  row,
  onSelect,
}: {
  row: WindowRow;
  onSelect: (id: number) => void;
}) {
  const severity = getSeverityLabel(row.rmsX, row.rmsY, row.rmsZ);
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      p={4}
      shadow="sm"
      cursor="pointer"
      onClick={() => onSelect(row.id)}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="semibold" fontSize="sm" color="gray.800">
          Window #{row.id}
        </Text>
        <Badge colorPalette={severity.palette} size="sm">
          {severity.label}
        </Badge>
      </HStack>
      <Text fontSize="xs" color="gray.400" mb={3}>
        {new Date(row.recordedAt).toLocaleString()}
      </Text>
      <HStack gap={4} fontSize="xs" fontFamily="mono">
        <Text>X: {row.rmsX.toFixed(4)}</Text>
        <Text>Y: {row.rmsY.toFixed(4)}</Text>
        <Text>Z: {row.rmsZ.toFixed(4)}</Text>
      </HStack>
    </Box>
  );
}

export function SensorWindowsTable({
  windows,
  page,
  totalPages,
  isLoading,
  onPrevPage,
  onNextPage,
}: Props) {
  const navigate = useNavigate();

  const handleSelect = (id: number) => {
    navigate(`/sensor-windows/${id}`);
  };

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Sensor Windows
        </Text>
        {totalPages > 1 && (
          <Text fontSize="xs" color="gray.400">
            Page {page} of {totalPages}
          </Text>
        )}
      </HStack>

      {/* Mobile: cards */}
      <Box display={{ base: "block", lg: "none" }}>
        {isLoading ? (
          <Text textAlign="center" py={8} color="gray.400">
            Loading...
          </Text>
        ) : windows.length === 0 ? (
          <Text textAlign="center" py={8} color="gray.400">
            No windows in this range
          </Text>
        ) : (
          <VStack gap={3} align="stretch">
            {windows.map((row) => (
              <WindowCard key={row.id} row={row} onSelect={handleSelect} />
            ))}
          </VStack>
        )}
      </Box>

      {/* Desktop: table */}
      <Box display={{ base: "none", lg: "block" }} overflowX="auto">
        <Table.Root variant="outline" rounded="md" w="full">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader w="60px">#</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">RMS X</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">RMS Y</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">RMS Z</Table.ColumnHeader>
              <Table.ColumnHeader>Level</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  textAlign="center"
                  py={8}
                  color="gray.400"
                >
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : windows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  textAlign="center"
                  py={8}
                  color="gray.400"
                >
                  No windows in this range
                </Table.Cell>
              </Table.Row>
            ) : (
              windows.map((w) => {
                const severity = getSeverityLabel(w.rmsX, w.rmsY, w.rmsZ);
                return (
                  <Table.Row
                    key={w.id}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleSelect(w.id)}
                  >
                    <Table.Cell color="gray.400" fontSize="sm">
                      {w.id}
                    </Table.Cell>
                    <Table.Cell fontSize="sm" whiteSpace="nowrap">
                      {new Date(w.recordedAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm">
                      {w.rmsX.toFixed(4)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm">
                      {w.rmsY.toFixed(4)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm">
                      {w.rmsZ.toFixed(4)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={severity.palette} size="sm">
                        {severity.label}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {totalPages > 1 && (
        <HStack justify="center" mt={4} gap={2}>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={onPrevPage}
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
            onClick={onNextPage}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
}
