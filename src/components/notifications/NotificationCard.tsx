import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import type {
  Notification,
  NotificationState,
  SeverityLevel,
} from "../../types/notification.types";

const severityColor: Record<SeverityLevel, string> = {
  low: "blue",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

const stateColor: Record<NotificationState, string> = {
  unread: "gray",
  in_investigation: "purple",
  resolved: "green",
  dismissed: "red",
};

const stateLabel: Record<NotificationState, string> = {
  unread: "Unread",
  in_investigation: "In Investigation",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

interface Props {
  notification: Notification;
  onClick: () => void;
}

export function NotificationCard({ notification, onClick }: Props) {
  return (
    <Box
      bg={notification.state === "unread" ? "yellow.50" : "white"}
      rounded="xl"
      p={4}
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      onClick={onClick}
    >
      <HStack justify="space-between" mb={2}>
        <HStack gap={2}>
          <Badge colorPalette={severityColor[notification.severity]} size="sm">
            {notification.severity}
          </Badge>
          <Badge
            colorPalette={stateColor[notification.state]}
            variant="outline"
            size="sm"
          >
            {stateLabel[notification.state]}
          </Badge>
        </HStack>
        {notification.device && (
          <Text fontSize="xs" color="muted.500" truncate maxW="120px">
            {notification.device.name}
          </Text>
        )}
      </HStack>

      <Text
        fontSize="sm"
        fontWeight={notification.state === "unread" ? "semibold" : "normal"}
        color="muted.900"
        css={{ lineClamp: "2" }}
        mb={1}
      >
        {notification.message}
      </Text>

      <Text fontSize="xs" color="muted.400">
        {new Date(notification.createdAt).toLocaleString()}
      </Text>
    </Box>
  );
}
