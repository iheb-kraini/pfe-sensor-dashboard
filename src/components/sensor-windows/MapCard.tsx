import { Box, Skeleton, Text } from "@chakra-ui/react";

interface MapCardProps {
  lat: number | null;
  lon: number | null;
  isLoading: boolean;
}

export function MapCard({ lat, lon, isLoading }: MapCardProps) {
  if (isLoading) return <Skeleton h="350px" rounded="xl" />;

  if (!lat || !lon) {
    return (
      <Box
        bg="white"
        rounded="xl"
        p={5}
        borderWidth="1px"
        borderColor="gray.100"
        shadow="sm"
        textAlign="center"
      >
        <Text fontSize="2xl" mb={2}>
          📍
        </Text>
        <Text color="gray.400" fontSize="sm">
          No GPS fix
        </Text>
      </Box>
    );
  }
  const latNum = Number(lat);
  const lonNum = Number(lon);

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lonNum - 0.01},${latNum - 0.01},${lonNum + 0.01},${latNum + 0.01}&layer=mapnik&marker=${latNum},${lonNum}`;

  return (
    <Box
      bg="white"
      rounded="xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
    >
      <Box px={5} pt={4} pb={2}>
        <Text
          fontSize="xs"
          color="gray.400"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Location
        </Text>
        <Text fontSize="sm" color="gray.600" fontFamily="mono" mt={1}>
          {latNum.toFixed(6)}, {lonNum.toFixed(6)}
        </Text>
      </Box>
      <iframe
        src={src}
        width="100%"
        height="350px"
        style={{ border: "none", display: "block" }}
      />{" "}
    </Box>
  );
}
