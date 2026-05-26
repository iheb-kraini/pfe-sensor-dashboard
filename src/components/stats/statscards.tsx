import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuUsers, LuUserCheck, LuRadio, LuBellRing } from "react-icons/lu";

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  subValue?: number;
  icon: ReactNode;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  sub,
  subValue,
  icon,
  isLoading,
}: StatCardProps) {
  return (
    <Box bg="white" rounded="xl" p={6} shadow="sm" transition="all 0.2s" _hover={{ shadow: "md", transform: "translateY(-2px)" }}>
      <Box mb={3} color="muted.400">
        {icon}
      </Box>

      {isLoading ? (
        <>
          <Skeleton h="32px" w="80px" mb={2} rounded="md" />
          <Skeleton h="14px" w="120px" rounded="md" />
        </>
      ) : (
        <>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="muted.900"
            lineHeight={1}
          >
            {value.toLocaleString()}
          </Text>
          <Text fontSize="sm" color="muted.500" mt={1}>
            {label}
          </Text>
          {sub && subValue !== undefined && (
            <Text fontSize="xs" color="muted.400" mt={2}>
              {subValue.toLocaleString()} {sub}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}

interface Props {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  onlineDevices: number;
  totalAlerts: number;
  unreadAlerts: number;
  isLoading: boolean;
}

export function StatsCards({
  totalUsers,
  activeUsers,
  totalDevices,
  onlineDevices,
  totalAlerts,
  unreadAlerts,
  isLoading,
}: Props) {
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(4, 1fr)",
      }}
      gap={4}
      mb={8}
    >
      <StatCard
        icon={<LuUsers size={22} />}
        label="Total Users"
        value={totalUsers}
        sub="active"
        subValue={activeUsers}
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuUserCheck size={22} />}
        label="Active Users"
        value={activeUsers}
        sub={`of ${totalUsers} total`}
        subValue={totalUsers - activeUsers}
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuRadio size={22} />}
        label="Total Devices"
        value={totalDevices}
        sub="online"
        subValue={onlineDevices}
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuBellRing size={22} />}
        label="Total Alerts"
        value={totalAlerts}
        sub="unopened"
        subValue={unreadAlerts}
        isLoading={isLoading}
      />
    </Grid>
  );
}
