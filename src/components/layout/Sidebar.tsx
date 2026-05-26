import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { LuRadio, LuUser, LuSettings } from "react-icons/lu";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const baseNavItems: NavItem[] = [
  { label: "Devices", path: "/devices", icon: <LuRadio size={18} /> },
  { label: "Profile", path: "/profile", icon: <LuUser size={18} /> },
];

const adminNavItems: NavItem[] = [
  { label: "Admin Panel", path: "/admin", icon: <LuSettings size={18} /> },
];

export function Sidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <Box
      w="240px"
      h="full"
      bg="linear-gradient(180deg, #111827 0%, #1f2937 100%)"
      color="white"
      px={4}
      py={6}
      flexShrink={0}
      display="flex"
      flexDirection="column"
    >
      {/* Logo */}
      <Flex gap={2.5} px={2} mb={10} justify="center" align="center">
        <Box w="8px" h="8px" rounded="full" bg="blue.400" shadow="0 0 6px rgba(59,130,246,0.6)" />
        <Text fontWeight="bold" fontSize="md" letterSpacing="tight">
          RailMonitor
        </Text>
      </Flex>

      {/* Nav items */}
      <VStack align="stretch" gap={1} flex={1}>
        <Text fontSize="xs" color="gray.500" px={3} mb={1} fontWeight="semibold" letterSpacing="wider" textTransform="uppercase">
          Navigation
        </Text>
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
                position="relative"
                _hover={{
                  bg: isActive ? "blue.600" : "gray.700",
                  color: "white",
                }}
                transition="all 0.15s"
                cursor="pointer"
              >
                {isActive && (
                  <Box
                    position="absolute"
                    left="-12px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="3px"
                    h="60%"
                    bg="blue.400"
                    rounded="full"
                  />
                )}
                <Box opacity={isActive ? 1 : 0.6}>
                  {item.icon}
                </Box>
                <Text fontSize="sm" fontWeight="medium">
                  {item.label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>

      {/* Live indicator */}
      <Flex px={3} py={3} align="center" gap={2.5} borderTop="1px solid" borderColor="gray.700">
        <Box
          w="7px"
          h="7px"
          rounded="full"
          bg="green.400"
          boxShadow="0 0 8px rgba(74,222,128,0.5)"
          animation="pulse 2s infinite"
        />
        <Text fontSize="xs" color="gray.400" fontWeight="medium">
          System Online
        </Text>
      </Flex>
    </Box>
  );
}
