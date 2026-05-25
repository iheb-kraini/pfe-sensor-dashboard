import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useNotifications } from "../../hooks/useNotifications";
import { useMqttNotifications } from "../../hooks/useMqttNotifications";
import MobileSidebar from "./mobileDrawer";

export function AppShell() {
  useNotifications(); // initial fetch
  useMqttNotifications(); // live updates
  return (
    <Flex minH="100vh" bg="gray.50">
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>
      <MobileSidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Topbar />
        <Box as="main" flex={1} overflow="auto" p={6}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
