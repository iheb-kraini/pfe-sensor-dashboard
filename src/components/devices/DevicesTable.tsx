import {
  Badge,
  Button,
  HStack,
  Skeleton,
  Table,
  TooltipArrow,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from "@chakra-ui/react";
import { LuCopy, LuCheck, LuEye, LuPencil, LuPower, LuRefreshCw } from "react-icons/lu";
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
          <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Name</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Serial Number</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Status</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Active</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Created At</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="center" fontWeight="semibold" color="muted.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Actions</Table.ColumnHeader>
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
            <Table.Cell colSpan={6} textAlign="center" py={8} color="muted.400">
              No devices found
            </Table.Cell>
          </Table.Row>
        ) : (
          data?.data.map((device) => (
            <Table.Row key={device.id} transition="background 0.15s" _hover={{ bg: "muted.100" }}>
              <Table.Cell fontWeight="medium" color="muted.900">{device.name}</Table.Cell>
              <Table.Cell color="muted.500" fontSize="sm">
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
              <Table.Cell color="muted.500" fontSize="sm">
                {new Date(device.createdAt).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <HStack gap={0} justifyContent="center">
                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Edit device"
                        onClick={() => openEdit(device)}
                      >
                        <LuPencil size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        Edit
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>

                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={device.isActive ? "Deactivate device" : "Activate device"}
                        colorPalette={device.isActive ? "red" : "green"}
                        loading={isActivating || isDeactivating}
                        onClick={() => handleToggleActive(device)}
                      >
                        <LuPower size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        {device.isActive ? "Deactivate" : "Activate"}
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>

                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Refresh API key"
                        colorPalette="purple"
                        loading={isRefreshing}
                        onClick={() => refreshApiKey(device.id)}
                      >
                        <LuRefreshCw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        Refresh API Key
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>

                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Copy API key"
                        colorPalette={copiedId === device.id ? "green" : "orange"}
                        onClick={() => handleCopy(device)}
                      >
                        {copiedId === device.id ? <LuCheck size={16} /> : <LuCopy size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        {copiedId === device.id ? "Copied!" : "Copy API Key"}
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>

                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="View sensor data"
                        colorPalette="teal"
                        onClick={() =>
                          navigate(`/devices/${device.id}/sensor-windows`)
                        }
                      >
                        <LuEye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        View Sensor Data
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </>
  );
}
