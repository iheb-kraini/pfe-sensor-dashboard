import { Box, Button, HStack, Input, Stack, Text } from "@chakra-ui/react";

interface Props {
  from: string;
  to: string;
  hasFilters: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onRangePreset: (hours: number) => void;
}

const RANGE_PRESETS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 },
] as const;

export function SensorWindowFilters({
  from,
  to,
  hasFilters,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  onRangePreset,
}: Props) {
  return (
    <Box bg="white" shadow="sm" rounded="xl" p={4} mb={6}>
      <Stack gap={3}>
        <HStack gap={2} flexWrap="wrap">
          <Stack gap={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              From
            </Text>
            <Input
              type="datetime-local"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              maxW="220px"
              size="sm"
            />
          </Stack>
          <Stack gap={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              To
            </Text>
            <Input
              type="datetime-local"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              maxW="220px"
              size="sm"
            />
          </Stack>
          <Button
            size="sm"
            colorPalette="blue"
            alignSelf="flex-end"
            onClick={onApply}
          >
            Apply
          </Button>
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              colorPalette="red"
              alignSelf="flex-end"
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </HStack>
        <HStack gap={2}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Quick:
          </Text>
          {RANGE_PRESETS.map(({ label, hours }) => (
            <Button
              key={hours}
              size="xs"
              variant="outline"
              onClick={() => onRangePreset(hours)}
            >
              {label}
            </Button>
          ))}
        </HStack>
      </Stack>
    </Box>
  );
}
