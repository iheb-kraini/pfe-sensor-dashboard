import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { NotificationBell } from "../notifications/NotificationBell";
import { useSidebarStore } from "../../store/sidebarStore";
import { LuMenu } from "react-icons/lu";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const onToggle = useSidebarStore((s) => s.onToggle);

  return (
    <Box
      h="60px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={6}
      flexShrink={0}
    >
      <Flex h="full" align="center" justify="space-between">
        <Flex align="center" gap={3}>
          {/* Hamburger — mobile only */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Open menu"
            variant="ghost"
            size="sm"
            onClick={onToggle}
          >
            <LuMenu />
          </IconButton>

          <Text
            fontSize="sm"
            color="gray.600"
            display={{ base: "none", sm: "block" }}
          >
            Welcome back,{" "}
            <Text as="span" fontWeight="semibold" color="gray.800">
              {user?.firstName} {user?.lastName}
            </Text>
          </Text>
        </Flex>

        <Flex align="center" gap={4} justify={"space-between"}>
          <Box
            px={2}
            py={1}
            rounded="md"
            bg={user?.role === "admin" ? "purple.100" : "blue.100"}
            color={user?.role === "admin" ? "purple.700" : "blue.700"}
            fontSize="xs"
            fontWeight="semibold"
            textTransform="capitalize"
          >
            {user?.role}
          </Box>
          <NotificationBell />
          <Button size="sm" variant="ghost" colorPalette="red" onClick={logout}>
            Sign out
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
