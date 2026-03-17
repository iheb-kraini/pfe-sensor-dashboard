import { Button, HStack, Input, NativeSelect } from "@chakra-ui/react";
import type { DeviceStatus } from "../../types/device.types";

interface Props {
  name: string;
  status: DeviceStatus | "";
  isActive: boolean | "";
  hasFilters: boolean;
  onNameChange: (v: string) => void;
  onStatusChange: (v: DeviceStatus | "") => void;
  onIsActiveChange: (v: boolean | "") => void;
  onReset: () => void;
}

export function DeviceFilters({
  name,
  status,
  isActive,
  hasFilters,
  onNameChange,
  onStatusChange,
  onIsActiveChange,
  onReset,
}: Props) {
  return (
    <HStack mb={4} gap={3} flexWrap="wrap">
      <Input
        placeholder="Search by name..."
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        maxW="220px"
      />

      <NativeSelect.Root maxW="160px">
        <NativeSelect.Field
          value={status}
          onChange={(e) => onStatusChange(e.target.value as DeviceStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <NativeSelect.Root maxW="160px">
        <NativeSelect.Field
          value={isActive === "" ? "" : String(isActive)}
          onChange={(e) => {
            const v = e.target.value;
            onIsActiveChange(v === "" ? "" : v === "true");
          }}
        >
          <option value="">All devices</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {hasFilters && (
        <Button size="sm" variant="ghost" colorPalette="red" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </HStack>
  );
}
