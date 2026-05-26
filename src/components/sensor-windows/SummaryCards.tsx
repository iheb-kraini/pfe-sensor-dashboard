import { Box, HStack, Text } from "@chakra-ui/react";

interface Props {
  totalWindows: number;
  maxRms: number | null;
  dominantAxis: string | null;
  dominantAxisPct: number;
  coverageHours: number;
  isLoading: boolean;
}

export function SummaryCards({
  totalWindows,
  maxRms,
  dominantAxis,
  dominantAxisPct,
  coverageHours,
  isLoading,
}: Props) {
  if (isLoading) return null;

  const cards = [
    {
      label: "Windows",
      value: totalWindows.toLocaleString(),
    },
    {
      label: "Max RMS",
      value: maxRms != null ? `${maxRms.toFixed(2)} m/s²` : "\u2014",
    },
    {
      label: "Coverage",
      value: `${coverageHours.toFixed(1)}h`,
    },
    {
      label: "Dominant",
      value:
        dominantAxis && dominantAxisPct > 0
          ? `${dominantAxis.toUpperCase()} ${dominantAxisPct}%`
          : "\u2014",
    },
  ];

  return (
    <HStack gap={4} flexWrap="wrap">
      {cards.map(({ label, value }) => (
        <Box
          key={label}
          bg="white"
          rounded="lg"
          px={5}
          py={4}
          shadow="sm"
          flex="1"
          minW="140px"
        >
          <Text
            fontSize="xs"
            color="muted.400"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="muted.900" mt={1}>
            {value}
          </Text>
        </Box>
      ))}
    </HStack>
  );
}
