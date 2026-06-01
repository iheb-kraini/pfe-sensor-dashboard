import { Box, Button, HStack, Input, Stack, Text, Kbd } from "@chakra-ui/react";

interface Props {
  from: string;
  rangeHours: number;
  hasFilters: boolean;
  onFromChange: (v: string) => void;
  onRangeChange: (hours: number) => void;
  onApply: () => void;
  onClear: () => void;
}

const RANGE_OPTIONS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 },
] as const;

export function SensorWindowFilters({
  from,
  rangeHours,
  hasFilters,
  onFromChange,
  onRangeChange,
  onApply,
  onClear,
}: Props) {
  const to = from
    ? new Date(new Date(from).getTime() + rangeHours * 60 * 60 * 1000)
    : null;

  return (
    <Box bg="white" shadow="sm" rounded="xl" p={6} mb={6}>
      <Stack gap={3}>
        <HStack gap={4} flexWrap="wrap">
          <Stack gap={1}>
            <Text fontSize="xs" color="muted.500" fontWeight="medium">
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
            <Text fontSize="xs" color="muted.500" fontWeight="medium">
              Range
            </Text>
            <HStack gap={1}>
              {RANGE_OPTIONS.map(({ label, hours }) => (
                <Button
                  key={hours}
                  size="sm"
                  variant={rangeHours === hours ? "solid" : "outline"}
                  colorPalette={rangeHours === hours ? "blue" : "gray"}
                  onClick={() => onRangeChange(hours)}
                >
                  {label}
                </Button>
              ))}
            </HStack>
          </Stack>
          {to && (
            <Stack gap={1}>
              <Text fontSize="xs" color="muted.500" fontWeight="medium">
                To
              </Text>
              <Kbd
                fontSize="sm"
                px={3}
                py={2}
                bg="gray.50"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
                rounded="md"
                whiteSpace="nowrap"
              >
                {to.toLocaleString()}
              </Kbd>
            </Stack>
          )}
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
      </Stack>
    </Box>
  );
}
