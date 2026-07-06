import { Badge, Box, Grid, HStack, Text } from "@chakra-ui/react";

interface AxisBlockProps {
  axis: string;
  rms: number;
  p2p: number;
  min: number;
  max: number;
  isDominant: boolean;
}

export function AxisBlock({
  axis,
  rms,
  p2p,
  min,
  max,
  isDominant,
}: AxisBlockProps) {
  return (
    <Box
      bg={isDominant ? "orange.50" : "gray.50"}
      rounded="lg"
      p={4}
      borderWidth="1px"
      borderColor={isDominant ? "orange.200" : "gray.100"}
    >
      <HStack mb={3} justify="space-between">
        <Text
          fontWeight="bold"
          fontSize="lg"
          color="gray.700"
          textTransform="uppercase"
        >
          {axis}-axis
        </Text>
        {isDominant && (
          <Badge colorPalette="orange" size="sm">
            Dominant
          </Badge>
        )}
      </HStack>
      <Grid templateColumns="1fr 1fr" gap={3}>
        {[
          { label: "RMS", value: rms.toFixed(4) },
          { label: "P2P", value: p2p.toFixed(4) },
          { label: "Min", value: min.toFixed(4) },
          { label: "Max", value: max.toFixed(4) },
        ].map(({ label, value }) => (
          <Box key={label}>
            <Text fontSize="xs" color="gray.400" fontWeight="medium">
              {label}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.700"
              fontFamily="mono"
            >
              {value}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
