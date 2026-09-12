import { Box, Button, Flex, Heading, HStack, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuArrowRight, LuBell, LuRadio, LuShield, LuUser } from "react-icons/lu";
import { useAuthStore } from "../../store/auth.store";
import { useDevices } from "../../hooks/useDevices";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "../../components/notifications/NotificationItem";

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const navigate = useNavigate();

  const { data: deviceData, isLoading: devicesLoading } = useDevices({ limit: 100 });
  const { notifications, isLoading: notifsLoading } = useNotifications({ limit: 5 });

  const devices = deviceData?.data ?? [];

  const activeCount = devices.filter((d) => d.isActive).length;
  const inactiveCount = devices.length - activeCount;

  const totalDevices = devices.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Box>
      <Stack mb={6} gap={0}>
        <Heading size="xl" fontWeight="extrabold" color="muted.900">
          {greeting}, {user?.firstName ?? "User"}
        </Heading>
        <Text color="muted.500" fontSize="sm" mt={1}>
          Here's an overview of your system
        </Text>
      </Stack>

      <HStack gap={4} flexWrap="wrap" mb={6}>
        <SummaryStat label="Total Devices" value={totalDevices} />
        <SummaryStat label="Active" value={activeCount} color="green.500" />
        <SummaryStat label="Inactive" value={inactiveCount} color="red.500" />
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
        <Box bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
          <HStack justify="space-between" px={5} py={3} borderBottom="1px solid" borderColor="muted.100">
            <HStack gap={2}>
              <LuBell size={16} />
              <Text fontSize="sm" fontWeight="semibold" color="muted.700">Recent Notifications</Text>
            </HStack>
            <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => navigate("/notifications")}>
              View all
            </Button>
          </HStack>
          {notifsLoading ? (
            <Box px={5} py={8}>
              <Text fontSize="sm" color="muted.400">Loading...</Text>
            </Box>
          ) : notifications.length > 0 ? (
            <VStack gap={0} align="stretch">
              {notifications.slice(0, 4).map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </VStack>
          ) : (
            <Flex direction="column" align="center" py={8} color="muted.400" gap={2}>
              <LuBell size={28} opacity={0.4} />
              <Text fontSize="sm">No recent notifications</Text>
            </Flex>
          )}
        </Box>

        <Box bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box px={5} py={3} borderBottom="1px solid" borderColor="muted.100">
            <Text fontSize="sm" fontWeight="semibold" color="muted.700">Quick Actions</Text>
          </Box>
          <VStack gap={0} align="stretch" p={3}>
            <QuickAction
              icon={<LuRadio size={18} />}
              label="Manage Devices"
              desc="View and configure your devices"
              onClick={() => navigate("/devices")}
            />
            <QuickAction
              icon={<LuBell size={18} />}
              label="Notifications"
              desc="Review alerts and events"
              onClick={() => navigate("/notifications")}
            />
            <QuickAction
              icon={<LuUser size={18} />}
              label="Profile Settings"
              desc="Update your account information"
              onClick={() => navigate("/profile")}
            />
            {isAdmin && (
              <QuickAction
                icon={<LuShield size={18} />}
                label="Admin Panel"
                desc="System-wide management"
                onClick={() => navigate("/admin")}
              />
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      <Box bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        <HStack justify="space-between" px={5} py={3} borderBottom="1px solid" borderColor="muted.100">
          <Text fontSize="sm" fontWeight="semibold" color="muted.700">Recently Added Devices</Text>
          <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => navigate("/devices")}>
            View all
          </Button>
        </HStack>
        {devicesLoading ? (
          <Box px={5} py={8}>
            <Text fontSize="sm" color="muted.400">Loading...</Text>
          </Box>
        ) : devices.length > 0 ? (
          <VStack gap={0} align="stretch">
            {devices.slice(0, 5).map((device) => (
              <HStack
                key={device.id}
                px={5}
                py={3}
                justify="space-between"
                cursor="pointer"
                transition="background 0.15s"
                _hover={{ bg: "muted.50" }}
                onClick={() => navigate(`/devices/${device.id}/sensor-windows`)}
                borderBottom="1px solid"
                borderColor="muted.50"
              >
                <HStack gap={3}>
                  <Stack gap={0}>
                    <Text fontSize="sm" fontWeight="semibold" color="muted.900">{device.name}</Text>
                    <Text fontSize="xs" color="muted.400">Added {new Date(device.createdAt).toLocaleDateString()}</Text>
                  </Stack>
                </HStack>
                <LuArrowRight size={14} opacity={0.4} />
              </HStack>
            ))}
          </VStack>
        ) : (
          <Flex direction="column" align="center" py={8} color="muted.400" gap={2}>
            <LuRadio size={28} opacity={0.4} />
            <Text fontSize="sm">No devices found</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Box
      bg="white"
      rounded="lg"
      px={5}
      py={4}
      shadow="sm"
      flex="1"
      minW="140px"
      transition="all 0.2s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
    >
      <Text fontSize="xs" color="muted.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={color ?? "muted.900"} mt={1}>
        {value}
      </Text>
    </Box>
  );
}

function QuickAction({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <HStack
      gap={3}
      px={3}
      py={3}
      rounded="lg"
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ bg: "muted.50" }}
      onClick={onClick}
    >
      <Box color="accent" opacity={0.7}>
        {icon}
      </Box>
      <Stack gap={0} flex={1}>
        <Text fontSize="sm" fontWeight="medium" color="muted.900">{label}</Text>
        <Text fontSize="xs" color="muted.400">{desc}</Text>
      </Stack>
      <LuArrowRight size={14} color="var(--chakra-colors-muted-300)" />
    </HStack>
  );
}
