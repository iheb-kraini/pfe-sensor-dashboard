import type { ReactNode } from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <Grid templateColumns="140px 1fr" gap={2} alignItems="start">
      <Text fontSize="sm" color="muted.500" fontWeight="medium">
        {label}
      </Text>
      <Box fontSize="sm" color="muted.900">
        {children}
      </Box>
    </Grid>
  );
}
