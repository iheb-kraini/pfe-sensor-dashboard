import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DeviceFormModal } from "../../components/devices/DeviceFormModal";
import {
  useActivateDevice,
  useDeactivateDevice,
  useDevices,
  useRefreshApiKey,
} from "../../hooks/useDevices";
import type { Device } from "../../types/device.types";
import { useDeviceModal } from "../../hooks/useDeviceModal";
import { useState } from "react";
import { useDeviceFilters } from "../../hooks/useDeviceFilters";
import { DeviceFilters } from "../../components/devices/DeviceFilters";
import { useNavigate } from "react-router-dom";

// ─── Device Card (mobile only) ───────────────────────────────────────────────
function DeviceCard({
  device,
  onEdit,
  onCopy,
  copiedId,
  navigate,
}: {
  device: Device;
  onEdit: (d: Device) => void;
  onCopy: (d: Device) => void;
  copiedId: number | null;
  navigate: (path: string) => void;
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      p={4}
      shadow="sm"
    >
      {/* Header row */}
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Text fontWeight="semibold" fontSize="sm" color="gray.800">
            {device.name}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
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

      {/* Created */}
      <Text fontSize="xs" color="gray.400" mb={4}>
        Created {new Date(device.createdAt).toLocaleDateString()}
      </Text>

      {/* Actions — only the important 3 */}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export function DevicesPage() {
  const navigate = useNavigate();

  const { open, selectedDevice, openCreate, openEdit, onClose } =
    useDeviceModal();
  const {
    name,
    status,
    isActive,
    filters,
    hasFilters,
    setName,
    setStatus,
    setIsActive,
    resetFilters,
  } = useDeviceFilters();
  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useDevices(filters);
  const { mutate: activate, isPending: isActivating } = useActivateDevice();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateDevice();
  const { mutate: refreshApiKey, isPending: isRefreshing } = useRefreshApiKey();

  const handleToggleActive = (device: Device) => {
    device.isActive ? deactivate(device.id) : activate(device.id);
  };

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (device: Device) => {
    navigator.clipboard.writeText(device.apiKey ?? "");
    setCopiedId(device.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isEmpty = !isLoading && data?.data.length === 0;

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Page header */}
      <HStack justify="space-between" mb={6}>
        <Heading size={{ base: "md", md: "lg" }}>Devices</Heading>
        <Button
          size={{ base: "sm", md: "md" }}
          colorPalette="blue"
          onClick={openCreate}
        >
          + New Device
        </Button>
      </HStack>

      <DeviceFilters
        name={name}
        status={status}
        isActive={isActive}
        hasFilters={hasFilters}
        onNameChange={setName}
        onStatusChange={setStatus}
        onIsActiveChange={setIsActive}
        onReset={resetFilters}
      />

      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load devices. Please try again.
        </Box>
      )}

      {/* ── Mobile: cards (base → sm) ── */}
      <Box display={{ base: "block", lg: "none" }}>
        {isLoading ? (
          <Text textAlign="center" py={8} color="gray.400">
            Loading...
          </Text>
        ) : isEmpty ? (
          <Text textAlign="center" py={8} color="gray.400">
            No devices found
          </Text>
        ) : (
          <VStack gap={3} align="stretch">
            {data?.data.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onEdit={openEdit}
                onCopy={handleCopy}
                copiedId={copiedId}
                navigate={navigate}
              />
            ))}
          </VStack>
        )}
      </Box>

      {/* ── Desktop: full table (lg+) ── */}
      <Box display={{ base: "none", lg: "block" }}>
        <Table.Root variant="outline" rounded="md">
          <TableContent
            data={data}
            isLoading={isLoading}
            isEmpty={isEmpty}
            openEdit={openEdit}
            handleToggleActive={handleToggleActive}
            isActivating={isActivating}
            isDeactivating={isDeactivating}
            refreshApiKey={refreshApiKey}
            isRefreshing={isRefreshing}
            handleCopy={handleCopy}
            copiedId={copiedId}
            navigate={navigate}
          />
        </Table.Root>
      </Box>

      {/* Pagination */}
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

      <DeviceFormModal open={open} onClose={onClose} device={selectedDevice} />
    </Box>
  );
}

// ─── Shared table body (used for both tablet + desktop) ───────────────────────
function TableContent({
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
}: any) {
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
          <Table.Row>
            <Table.Cell colSpan={6} textAlign="center" py={8} color="gray.400">
              Loading...
            </Table.Cell>
          </Table.Row>
        ) : isEmpty ? (
          <Table.Row>
            <Table.Cell colSpan={6} textAlign="center" py={8} color="gray.400">
              No devices found
            </Table.Cell>
          </Table.Row>
        ) : (
          data?.data.map((device: Device) => (
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
