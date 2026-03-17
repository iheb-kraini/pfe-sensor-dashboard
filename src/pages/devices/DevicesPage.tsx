import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { DeviceFormModal } from "../../components/devices/DeviceFormModal";
import {
  useActivateDevice,
  useDeactivateDevice,
  useDevices,
  useRefreshApiKey,
} from "../../hooks/useDevices";
import type { Device } from "../../types/device.types";

export function DevicesPage() {
  const [page, setPage] = useState(1);
  //lot model logic here can we create hook for it ?
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
  //can we add page to useDevices hook  ?
  const { data, isLoading, isError } = useDevices({ page, limit: 10 });
  const { mutate: activate, isPending: isActivating } = useActivateDevice();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateDevice();
  const { mutate: refreshApiKey, isPending: isRefreshing } = useRefreshApiKey();

  const openCreate = () => {
    setSelectedDevice(undefined);
    setModalOpen(true);
  };

  const openEdit = (device: Device) => {
    setSelectedDevice(device);
    setModalOpen(true);
  };

  const handleToggleActive = (device: Device) => {
    if (device.isActive) {
      deactivate(device.id);
    } else {
      activate(device.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Devices</Heading>
        <Button colorPalette="blue" onClick={openCreate}>
          + New Device
        </Button>
      </HStack>

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load devices. Please try again.
        </Box>
      )}

      <Table.Root variant="outline" rounded="md">
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
          ) : data?.data.length === 0 ? (
            <Table.Row>
              <Table.Cell
                colSpan={6}
                textAlign="center"
                py={8}
                color="gray.400"
              >
                No devices found
              </Table.Cell>
            </Table.Row>
          ) : (
            data?.data.map((device) => (
              <Table.Row key={device.id}>
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
                  <HStack gap={2}>
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
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="center" mt={4} gap={2}>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </HStack>
      )}

      <DeviceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        device={selectedDevice}
      />
    </Box>
  );
}
