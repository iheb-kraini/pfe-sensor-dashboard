import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuRadio } from "react-icons/lu";
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
import { DeviceCard } from "../../components/devices/DeviceCard";
import { DevicesTable } from "../../components/devices/DevicesTable";

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
    <Box>
      <Box mb={6}>
        <HStack justify="space-between">
          <Heading size="xl" fontWeight="extrabold" color="muted.900">Devices</Heading>
          <Button
            size={{ base: "sm", md: "md" }}
            colorPalette="blue"
            onClick={openCreate}
          >
            + New Device
          </Button>
        </HStack>
        <Text color="muted.400" fontSize="sm" mt={1}>
          View and manage connected devices
        </Text>
      </Box>

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

      <Box display={{ base: "block", lg: "none" }}>
        {isLoading ? (
          <VStack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} h="150px" rounded="xl" w="full" />
            ))}
          </VStack>
        ) : isEmpty ? (
          <Flex direction="column" align="center" py={10} color="muted.400" gap={3}>
            <Box opacity={0.4}><LuRadio size={40} /></Box>
            <Text fontSize="sm">No devices found</Text>
          </Flex>
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

      <Box display={{ base: "none", lg: "block" }}>
        <Table.Root>
          <DevicesTable
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

      {totalPages > 1 && (
        <HStack justify="center" mt={6} gap={3}>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            onClick={prevPage}
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