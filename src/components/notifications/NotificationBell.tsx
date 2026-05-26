import { Box, Flex, Text, VStack, Popover, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../store/notification.store";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { LuBell } from "react-icons/lu";

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
          <LuBell size={20} />
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
            rounded="xl"
            overflow="hidden"
          >
            <Flex
              px={4}
              py={3}
              justify="space-between"
              align="center"
              borderBottom="1px solid"
              borderColor="muted.100"
            >
              <Text fontWeight="semibold" fontSize="sm" color="muted.900">
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

            {preview.length === 0 ? (
              <Flex justify="center" py={8}>
                <Text fontSize="sm" color="muted.400">
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

            <Flex
              px={4}
              py={2.5}
              borderTop="1px solid"
              borderColor="muted.100"
              justify="center"
            >
              <Text
                fontSize="xs"
                color="accent"
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
