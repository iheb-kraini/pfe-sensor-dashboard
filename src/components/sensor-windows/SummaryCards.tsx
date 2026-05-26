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
      accent: "blue.400",
    },
    {
      label: "Max RMS",
      value: maxRms != null ? `${maxRms.toFixed(2)} m/s²` : "\u2014",
      accent: "orange.400",
    },
    {
      label: "Coverage",
      value: `${coverageHours.toFixed(1)}h`,
      accent: "purple.400",
    },
    {
      label: "Dominant",
      value:
        dominantAxis && dominantAxisPct > 0
          ? `${dominantAxis.toUpperCase()} ${dominantAxisPct}%`
          : "\u2014",
      accent: "green.400",
    },
  ];

  return (
    <HStack gap={4} flexWrap="wrap">
      {cards.map(({ label, value, accent }) => (
        <Box
          key={label}
          bg="white"
          rounded="lg"
          px={4}
          py={3}
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          flex="1"
          minW="140px"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="3px"
            h="full"
            bg={accent}
          />
          <Text
            fontSize="xs"
            color="gray.400"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mt={1}>
            {value}
          </Text>
        </Box>
      ))}
    </HStack>
  );
}
