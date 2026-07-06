import { Box, Button, Flex, Text } from "@chakra-ui/react";
import {
  type Notification,
  NotificationState,
  type SeverityLevel,
} from "../../types/notification.types";

const severityDot: Record<SeverityLevel, string> = {
  low: "blue.400",
  medium: "yellow.400",
  high: "orange.400",
  critical: "red.400",
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
      borderColor="muted.100"
      bg={notification.state === NotificationState.UNREAD ? "yellow.50" : "white"}
      _hover={{ bg: "muted.50" }}
      transition="all 0.15s"
    >
      <Flex gap={3} align="flex-start">
        <Box
          mt={1.5}
          w="8px"
          h="8px"
          rounded="full"
          bg={severityDot[notification.severity]}
          flexShrink={0}
        />
        <Box flex={1} minW={0}>
          <Text fontSize="sm" color="muted.900" fontWeight="medium" lineClamp={2}>
            {notification.message}
          </Text>
          <Flex gap={1} mt={0.5} align="center">
            {notification.device && (
              <Text fontSize="xs" color="muted.500" flexShrink={0}>
                {notification.device.name}
              </Text>
            )}
            <Text fontSize="xs" color="muted.400">
              {new Date(notification.createdAt).toLocaleString()}
            </Text>
          </Flex>
        </Box>

        {onStateChange && notification.state === NotificationState.UNREAD && (
          <Flex gap={1} flexShrink={0}>
            <Button
              size="xs"
              colorPalette="blue"
              variant="subtle"
              onClick={() =>
                onStateChange(notification.id, NotificationState.IN_INVESTIGATION)
              }
            >
              Investigate
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={() =>
                onStateChange(notification.id, NotificationState.DISMISSED)
              }
            >
              Dismiss
            </Button>
          </Flex>
        )}

        {onStateChange &&
          notification.state === NotificationState.IN_INVESTIGATION && (
            <Button
              size="xs"
              colorPalette="blue"
              variant="subtle"
              flexShrink={0}
              onClick={() =>
                onStateChange(notification.id, NotificationState.RESOLVED)
              }
            >
              Resolve
            </Button>
          )}
      </Flex>
    </Box>
  );
}
