import { Box, HStack, Skeleton, Text } from "@chakra-ui/react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accent: string;
  isLoading: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  accent,
  isLoading,
}: StatCardProps) {
  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} w="4px" h="full" bg={accent} />
      <Text
        fontSize="xs"
        color="gray.400"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={2}
      >
        {label}
      </Text>
      {isLoading ? (
        <Skeleton h="28px" w="80px" rounded="md" />
      ) : (
        <HStack align="baseline" gap={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </Text>
          {unit && (
            <Text fontSize="sm" color="gray.400">
              {unit}
            </Text>
          )}
        </HStack>
      )}
    </Box>
  );
}
