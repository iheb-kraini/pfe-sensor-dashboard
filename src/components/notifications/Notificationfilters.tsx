import { Box, Button, Input, NativeSelect, Stack } from "@chakra-ui/react";
import type {
  NotificationState,
  SeverityLevel,
} from "../../types/notification.types";

interface Props {
  state: NotificationState | "";
  severity: SeverityLevel | "";
  from: string;
  to: string;
  hasFilters: boolean;
  onStateChange: (v: NotificationState | "") => void;
  onSeverityChange: (v: SeverityLevel | "") => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onReset: () => void;
}

export function NotificationFilters({
  state,
  severity,
  from,
  to,
  hasFilters,
  onStateChange,
  onSeverityChange,
  onFromChange,
  onToChange,
  onReset,
}: Props) {
  return (
    <Box bg="white" shadow="sm" rounded="xl" p={6} mb={6}>
      <Stack direction={{ base: "column", sm: "row" }} gap={3} flexWrap="wrap">
        <NativeSelect.Root maxW={{ base: "full", sm: "180px" }}>
          <NativeSelect.Field
            value={state}
            onChange={(e) =>
              onStateChange(e.target.value as NotificationState | "")
            }
          >
            <option value="">All states</option>
            <option value="unread">Unread</option>
            <option value="in_investigation">In Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <NativeSelect.Root maxW={{ base: "full", sm: "150px" }}>
          <NativeSelect.Field
            value={severity}
            onChange={(e) =>
              onSeverityChange(e.target.value as SeverityLevel | "")
            }
          >
            <option value="">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          maxW={{ base: "full", sm: "160px" }}
          fontSize="sm"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          maxW={{ base: "full", sm: "160px" }}
          fontSize="sm"
        />

        {hasFilters && (
          <Button size="sm" variant="ghost" colorPalette="red" onClick={onReset}>
            Clear filters
          </Button>
        )}
      </Stack>
    </Box>
  );
}
