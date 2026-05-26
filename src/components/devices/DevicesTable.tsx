import {
  Badge,
  Button,
  HStack,
  Skeleton,
  Table,
} from "@chakra-ui/react";
import type { Device } from "../../types/device.types";

interface DevicesTableProps {
  data: { data: Device[] } | undefined;
  isLoading: boolean;
  isEmpty: boolean;
  openEdit: (d: Device) => void;
  handleToggleActive: (d: Device) => void;
  isActivating: boolean;
  isDeactivating: boolean;
  refreshApiKey: (id: number) => void;
  isRefreshing: boolean;
  handleCopy: (d: Device) => void;
  copiedId: number | null;
  navigate: (path: string) => void;
}

export function DevicesTable({
  data,
  isLoading,
  isEmpty,
  openEdit,
  handleToggleActive,
  isActivating,
  isDeactivating,
  refreshApiKey,
  isRefreshing,
  handleCopy,
  copiedId,
  navigate,
}: DevicesTableProps) {
  return (
    <>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Serial Number</Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>Active</Table.ColumnHeader>
          <Table.ColumnHeader>Created At</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
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
        ) : isEmpty ? (
          <Table.Row>
            <Table.Cell colSpan={6} textAlign="center" py={8} color="gray.400">
              No devices found
            </Table.Cell>
          </Table.Row>
        ) : (
          data?.data.map((device: Device, i: number) => (
            <Table.Row
              key={device.id}
              bg={i % 2 === 0 ? "white" : "gray.50"}
              _hover={{ bg: "gray.100" }}
            >
              <Table.Cell fontWeight="medium">{device.name}</Table.Cell>
              <Table.Cell color="gray.500" fontSize="sm">
                {device.serialNumber}
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={
                    device.status === "online"
                      ? "green"
                      : device.status === "maintenance"
                        ? "orange"
                        : "gray"
                  }
                >
                  {device.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={device.isActive ? "green" : "red"}>
                  {device.isActive ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell color="gray.500" fontSize="sm">
                {new Date(device.createdAt).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <HStack gap={2} flexWrap="wrap">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => openEdit(device)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette={device.isActive ? "red" : "green"}
                    loading={isActivating || isDeactivating}
                    onClick={() => handleToggleActive(device)}
                  >
                    {device.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="purple"
                    loading={isRefreshing}
                    onClick={() => refreshApiKey(device.id)}
                  >
                    Refresh Key
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette={copiedId === device.id ? "green" : "orange"}
                    onClick={() => handleCopy(device)}
                  >
                    {copiedId === device.id ? "Copied!" : "Copy Key"}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="teal"
                    onClick={() =>
                      navigate(`/devices/${device.id}/sensor-windows`)
                    }
                  >
                    View Data
                  </Button>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </>
  );
}
