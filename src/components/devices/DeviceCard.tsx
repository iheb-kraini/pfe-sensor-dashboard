import { Badge, Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import type { Device } from "../../types/device.types";

interface DeviceCardProps {
  device: Device;
  onEdit: (d: Device) => void;
  onCopy: (d: Device) => void;
  copiedId: number | null;
  navigate: (path: string) => void;
}

export function DeviceCard({
  device,
  onEdit,
  onCopy,
  copiedId,
  navigate,
}: DeviceCardProps) {
  return (
    <Box bg="white" rounded="xl" p={5} shadow="sm">
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text fontWeight="semibold" fontSize="sm" color="muted.900">
            {device.name}
          </Text>
          <Text fontSize="xs" color="muted.400" mt={0.5}>
            {device.serialNumber}
          </Text>
        </Box>
        <HStack gap={2}>
          <Badge
            colorPalette={
              device.status === "online"
                ? "green"
                : device.status === "maintenance"
                  ? "orange"
                  : "gray"
            }
            fontSize="xs"
          >
            {device.status}
          </Badge>
          <Badge colorPalette={device.isActive ? "green" : "red"} fontSize="xs">
            {device.isActive ? "Active" : "Inactive"}
          </Badge>
        </HStack>
      </Flex>

      <Text fontSize="xs" color="muted.400" mb={4}>
        Created {new Date(device.createdAt).toLocaleDateString()}
      </Text>

      <HStack gap={2} flexWrap="wrap">
        <Button
          size="xs"
          variant="outline"
          flex={1}
          onClick={() => onEdit(device)}
        >
          Edit
        </Button>
        <Button
          size="xs"
          variant="outline"
          colorPalette="teal"
          flex={1}
          onClick={() => navigate(`/devices/${device.id}/sensor-windows`)}
        >
          View Data
        </Button>
        <Button
          size="xs"
          variant="outline"
          colorPalette={copiedId === device.id ? "green" : "orange"}
          flex={1}
          onClick={() => onCopy(device)}
        >
          {copiedId === device.id ? "Copied!" : "Copy Key"}
        </Button>
      </HStack>
    </Box>
  );
}
