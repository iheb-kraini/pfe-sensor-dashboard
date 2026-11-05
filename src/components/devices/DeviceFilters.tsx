import { Box, Button, HStack, Input, InputGroup, NativeSelect } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

interface Props {
  name: string;
  isActive: boolean | "";
  hasFilters: boolean;
  onNameChange: (v: string) => void;
  onIsActiveChange: (v: boolean | "") => void;
  onReset: () => void;
}

export function DeviceFilters({
  name,
  isActive,
  hasFilters,
  onNameChange,
  onIsActiveChange,
  onReset,
}: Props) {
  return (
    <Box bg="white" shadow="sm" rounded="xl" p={6} mb={6}>
      <HStack gap={4} flexWrap="wrap">
        <InputGroup startElement={<LuSearch size={16} />} maxW="220px">
          <Input
            placeholder="Search by name..."
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </InputGroup>

        <NativeSelect.Root maxW="160px">
          <NativeSelect.Field
            value={isActive === "" ? "" : String(isActive)}
            onChange={(e) => {
              const v = e.target.value;
              onIsActiveChange(v === "" ? "" : v === "true");
            }}
          >
            <option value="">Active / Inactive</option>
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
    </Box>
  );
}
