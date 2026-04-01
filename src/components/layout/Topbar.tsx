import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { NotificationBell } from "../notifications/NotificationBell";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

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
        <Text fontSize="sm" color="gray.600">
          Welcome back,{" "}
          <Text as="span" fontWeight="semibold" color="gray.800">
            {user?.firstName} {user?.lastName}
          </Text>
        </Text>

        <Flex align="center" gap={4}>
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
          <NotificationBell /> {/* ← added */}
          <Button size="sm" variant="ghost" colorPalette="red" onClick={logout}>
            Sign out
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
