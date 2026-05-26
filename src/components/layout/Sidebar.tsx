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
      bg="bg.sidebar"
      color="white"
      px={5}
      py={6}
      flexShrink={0}
      display="flex"
      flexDirection="column"
    >
      <Flex gap={2.5} px={2} mb={10} justify="center" align="center">
        <Box w="8px" h="8px" rounded="full" bg="accent" />
        <Text fontWeight="bold" fontSize="md" letterSpacing="tight">
          RailMonitor
        </Text>
      </Flex>

      <VStack align="stretch" gap={1} flex={1}>
        <Text fontSize="xs" color="muted.400" px={3} mb={1} fontWeight="semibold" letterSpacing="wider" textTransform="uppercase">
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
                bg={isActive ? "accent" : "transparent"}
                color={isActive ? "white" : "muted.300"}
                position="relative"
                _hover={{
                  bg: isActive ? "accent" : "muted.700",
                  color: "white",
                }}
                transition="all 0.15s"
                cursor="pointer"
              >
                {isActive && (
                  <Box
                    position="absolute"
                    left="-20px"
                    top="50%"
                    transform="translateY(-50%)"
                    w="3px"
                    h="60%"
                    bg="accent"
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

      <Flex px={3} py={3} align="center" gap={2.5} borderTop="1px solid" borderColor="muted.700">
        <Box w="7px" h="7px" rounded="full" bg="green.400" />
        <Text fontSize="xs" color="muted.400" fontWeight="medium">
          System Online
        </Text>
      </Flex>
    </Box>
  );
}