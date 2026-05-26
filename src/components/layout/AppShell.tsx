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
    <Flex h="100vh" overflow="hidden" bg="surface.page">
      <Box display={{ base: "none", md: "flex" }} flexShrink={0}>
        <Sidebar />
      </Box>
      <MobileSidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Topbar />
        <Box as="main" flex={1} overflowY="auto" px={8} pt={6} pb={8}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}