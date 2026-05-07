import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import {
  type Notification,
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
  unread: "red",
  in_investigation: "orange",
  resolved: "green",
  dismissed: "gray",
};

interface Props {
  notification: Notification;
  onStateChange?: (id: number, state: NotificationState) => void;
}

export function NotificationItem({ notification, onStateChange }: Props) {
  return (
    <Box
      px={4}
      py={3}
      borderBottom="1px solid"
      borderColor="gray.100"
      bg={notification.state === NotificationState.UNREAD ? "blue.50" : "white"}
      _hover={{ bg: "gray.50" }}
      transition="all 0.15s"
    >
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Box flex={1}>
          <Flex gap={2} align="center" mb={1} flexWrap="wrap">
            <Badge
              colorPalette={severityColor[notification.severity]}
              size="sm"
            >
              {notification.severity}
            </Badge>
            <Badge
              colorPalette={stateColor[notification.state]}
              size="sm"
              variant="outline"
            >
              {notification.state.replace("_", " ")}
            </Badge>
            {notification.device && (
              <Text fontSize="xs" color="gray.500">
                {notification.device.name}
              </Text>
            )}
          </Flex>
          <Text fontSize="sm" color="gray.800" fontWeight="medium">
            {notification.message}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </Box>

        {/* state actions */}
        {onStateChange && notification.state === NotificationState.UNREAD && (
          <Flex gap={1} flexShrink={0}>
            <Box
              as="button"
              fontSize="xs"
              px={2}
              py={1}
              rounded="md"
              bg="orange.100"
              color="orange.700"
              fontWeight="semibold"
              cursor="pointer"
              _hover={{ bg: "orange.200" }}
              onClick={() =>
                onStateChange(
                  notification.id,
                  NotificationState.IN_INVESTIGATION,
                )
              }
            >
              Investigate
            </Box>
            <Box
              as="button"
              fontSize="xs"
              px={2}
              py={1}
              rounded="md"
              bg="gray.100"
              color="gray.600"
              fontWeight="semibold"
              cursor="pointer"
              _hover={{ bg: "gray.200" }}
              onClick={() =>
                onStateChange(notification.id, NotificationState.DISMISSED)
              }
            >
              Dismiss
            </Box>
          </Flex>
        )}

        {onStateChange &&
          notification.state === NotificationState.IN_INVESTIGATION && (
            <Box
              as="button"
              fontSize="xs"
              px={2}
              py={1}
              rounded="md"
              bg="green.100"
              color="green.700"
              fontWeight="semibold"
              cursor="pointer"
              flexShrink={0}
              _hover={{ bg: "green.200" }}
              onClick={() =>
                onStateChange(notification.id, NotificationState.RESOLVED)
              }
            >
              Resolve
            </Box>
          )}
      </Flex>
    </Box>
  );
}
