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
      borderColor="muted.200"
      px={8}
      flexShrink={0}
    >
      <Flex h="full" align="center" justify="space-between">
        <Flex align="center" gap={3}>
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
            color="muted.500"
            display={{ base: "none", sm: "block" }}
          >
            Welcome back,{" "}
            <Text as="span" fontWeight="semibold" color="muted.900">
              {user?.firstName} {user?.lastName}
            </Text>
          </Text>
        </Flex>

        <Flex align="center" gap={4}>
          <Flex
            px={2.5}
            py={1.5}
            rounded="md"
            bg="muted.100"
            color="muted.600"
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