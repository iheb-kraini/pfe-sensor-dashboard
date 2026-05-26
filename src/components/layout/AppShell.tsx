import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useNotifications } from "../../hooks/useNotifications";
import { useMqttNotifications } from "../../hooks/useMqttNotifications";
import MobileSidebar from "./mobileDrawer";

export function AppShell() {
  useNotifications();
  useMqttNotifications();

  return (
    <Flex
      h="100vh"
      overflow="hidden"
      bg="linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)"
    >
      {/* Sidebar — never scrolls, stays full height */}
      <Box display={{ base: "none", md: "flex" }} flexShrink={0}>
        <Sidebar />
      </Box>
      <MobileSidebar />

      {/* Right side: topbar + scrollable content */}
      <Flex direction="column" flex={1} overflow="hidden">
        <Topbar />
        <Box as="main" flex={1} overflowY="auto" px={6} pt={6} pb={8}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
