import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuUsers, LuUserCheck, LuRadio, LuBellRing } from "react-icons/lu";

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  subValue?: number;
  accent: string;
  icon: ReactNode;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  sub,
  subValue,
  accent,
  icon,
  isLoading,
}: StatCardProps) {
  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      position="relative"
      overflow="hidden"
    >
      {/* accent bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="4px"
        h="full"
        bg={accent}
        rounded="full"
      />

      <Box mb={3} color="gray.600">
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
            color="gray.800"
            lineHeight={1}
          >
            {value.toLocaleString()}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {label}
          </Text>
          {sub && subValue !== undefined && (
            <Text fontSize="xs" color="gray.400" mt={2}>
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
        accent="blue.400"
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuUserCheck size={22} />}
        label="Active Users"
        value={activeUsers}
        sub={`of ${totalUsers} total`}
        subValue={totalUsers - activeUsers}
        accent="green.400"
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuRadio size={22} />}
        label="Total Devices"
        value={totalDevices}
        sub="online"
        subValue={onlineDevices}
        accent="purple.400"
        isLoading={isLoading}
      />
      <StatCard
        icon={<LuBellRing size={22} />}
        label="Total Alerts"
        value={totalAlerts}
        sub="unopened"
        subValue={unreadAlerts}
        accent="orange.400"
        isLoading={isLoading}
      />
    </Grid>
  );
}
