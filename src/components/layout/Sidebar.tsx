import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const baseNavItems: NavItem[] = [
  { label: "Devices", path: "/devices", icon: "📡" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

const adminNavItems: NavItem[] = [
  { label: "Admin Panel", path: "/admin", icon: "🛠️" },
];

export function Sidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <Box
      w="240px"
      minH="100vh"
      bg="gray.900"
      color="white"
      px={4}
      py={6}
      flexShrink={0}
    >
      {/* Logo */}
      <Flex align="center" gap={2} px={2} mb={8}>
        <Text fontSize="xl">🚆</Text>
        <Text fontWeight="bold" fontSize="md" letterSpacing="tight">
          RailMonitor
        </Text>
      </Flex>

      {/* Nav items */}
      <VStack align="stretch" gap={1}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Flex
                align="center"
                gap={3}
                px={3}
                py={2.5}
                rounded="lg"
                bg={isActive ? "blue.600" : "transparent"}
                color={isActive ? "white" : "gray.300"}
                _hover={{
                  bg: isActive ? "blue.600" : "gray.700",
                  color: "white",
                }}
                transition="all 0.15s"
                cursor="pointer"
              >
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {item.label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>
    </Box>
  );
}
