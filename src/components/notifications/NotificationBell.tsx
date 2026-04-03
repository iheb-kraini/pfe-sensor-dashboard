import { Box, Flex, Text, VStack, Popover, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../store/notification.store";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount } = useNotificationStore();
  const { changeState } = useNotifications();
  const navigate = useNavigate();

  const preview = notifications.slice(0, 5);

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Popover.Trigger asChild>
        <Box position="relative" cursor="pointer">
          <Box fontSize="xl" lineHeight={1} userSelect="none">
            🔔
          </Box>
          {unreadCount > 0 && (
            <Flex
              position="absolute"
              top="-6px"
              right="-6px"
              bg="red.500"
              color="white"
              rounded="full"
              w="18px"
              h="18px"
              align="center"
              justify="center"
              fontSize="10px"
              fontWeight="bold"
              pointerEvents="none"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Flex>
          )}
        </Box>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="360px"
            p={0}
            shadow="lg"
            border="1px solid"
            borderColor="gray.200"
            rounded="xl"
            overflow="hidden"
          >
            {/* header */}
            <Flex
              px={4}
              py={3}
              justify="space-between"
              align="center"
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Box
                  px={2}
                  py={0.5}
                  bg="red.100"
                  color="red.600"
                  rounded="full"
                  fontSize="xs"
                  fontWeight="semibold"
                >
                  {unreadCount} unread
                </Box>
              )}
            </Flex>

            {/* list */}
            {preview.length === 0 ? (
              <Flex justify="center" py={8}>
                <Text fontSize="sm" color="gray.400">
                  No notifications
                </Text>
              </Flex>
            ) : (
              <VStack gap={0} align="stretch" maxH="360px" overflowY="auto">
                {preview.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onStateChange={changeState}
                  />
                ))}
              </VStack>
            )}

            {/* footer */}
            <Flex
              px={4}
              py={2.5}
              borderTop="1px solid"
              borderColor="gray.100"
              justify="center"
            >
              <Text
                fontSize="xs"
                color="blue.600"
                fontWeight="semibold"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
              >
                View all notifications →
              </Text>
            </Flex>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
