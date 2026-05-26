import { Badge, Box, Button, Flex, HStack, Skeleton, Table, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuActivity } from "react-icons/lu";

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
      rounded="xl"
      p={5}
      shadow="sm"
      cursor="pointer"
      onClick={() => onSelect(row.id)}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="semibold" fontSize="sm" color="muted.900">
          Window #{row.id}
        </Text>
        <Badge colorPalette={severity.palette} size="sm">
          {severity.label}
        </Badge>
      </HStack>
      <Text fontSize="xs" color="muted.400" mb={3}>
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
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="bold" color="muted.700">
          Sensor Windows
        </Text>
        {totalPages > 1 && (
          <Text fontSize="xs" color="muted.400">
            Page {page} of {totalPages}
          </Text>
        )}
      </HStack>

      <Box display={{ base: "block", lg: "none" }}>
        {isLoading ? (
          <VStack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} h="120px" rounded="xl" w="full" />
            ))}
          </VStack>
        ) : windows.length === 0 ? (
          <Flex direction="column" align="center" py={10} color="muted.400" gap={3}>
            <Box opacity={0.4}><LuActivity size={36} /></Box>
            <Text fontSize="sm">No windows in this range</Text>
          </Flex>
        ) : (
          <VStack gap={3} align="stretch">
            {windows.map((row) => (
              <WindowCard key={row.id} row={row} onSelect={handleSelect} />
            ))}
          </VStack>
        )}
      </Box>

      <Box display={{ base: "none", lg: "block" }} overflowX="auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Time</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right" fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">RMS X</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right" fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">RMS Y</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right" fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">RMS Z</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Level</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Row key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Table.Cell key={j}>
                      <Skeleton h="20px" rounded="md" />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : windows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center" py={8} color="muted.400">
                  <Flex direction="column" align="center" gap={2}>
                    <Box opacity={0.4}><LuActivity size={28} /></Box>
                    <Text fontSize="sm">No windows in this range</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              windows.map((w) => {
                const severity = getSeverityLabel(w.rmsX, w.rmsY, w.rmsZ);
                return (
                  <Table.Row
                    key={w.id}
                    cursor="pointer"
                    _hover={{ bg: "muted.50" }}
                    onClick={() => handleSelect(w.id)}
                  >
                    <Table.Cell color="muted.400" fontSize="sm">
                      {w.id}
                    </Table.Cell>
                    <Table.Cell fontSize="sm" whiteSpace="nowrap" color="muted.900">
                      {new Date(w.recordedAt).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm" color="muted.900">
                      {w.rmsX.toFixed(4)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm" color="muted.900">
                      {w.rmsY.toFixed(4)}
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontFamily="mono" fontSize="sm" color="muted.900">
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
        <HStack justify="center" mt={6} gap={3}>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            onClick={onPrevPage}
          >
            Previous
          </Button>
          <Text fontSize="sm" color="muted.500">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="ghost"
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
