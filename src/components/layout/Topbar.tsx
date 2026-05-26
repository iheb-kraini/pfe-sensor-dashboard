import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { NotificationBell } from "../notifications/NotificationBell";
import { useSidebarStore } from "../../store/sidebarStore";
import { LuMenu, LuLogOut, LuShield, LuUser } from "react-icons/lu";

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
      shadow="sm"
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

          {/* Live dot */}
          <Box
            w="6px"
            h="6px"
            rounded="full"
            bg="green.400"
            boxShadow="0 0 6px rgba(74,222,128,0.5)"
            animation="pulse 2s infinite"
          />

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

        <Flex align="center" gap={3}>
          <Flex
            px={2.5}
            py={1.5}
            rounded="md"
            bg={user?.role === "admin" ? "purple.100" : "blue.100"}
            color={user?.role === "admin" ? "purple.700" : "blue.700"}
            fontSize="xs"
            fontWeight="semibold"
            align="center"
            gap={1.5}
          >
            {user?.role === "admin" ? <LuShield size={14} /> : <LuUser size={14} />}
            <Text textTransform="capitalize">{user?.role}</Text>
          </Flex>
          <NotificationBell />
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={logout}
            display={{ base: "none", md: "inline-flex" }}
          >
            <LuLogOut size={16} />
            <Text ml={1.5}>Sign out</Text>
          </Button>
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Sign out"
            variant="ghost"
            colorPalette="red"
            size="sm"
            onClick={logout}
          >
            <LuLogOut size={18} />
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  );
}
