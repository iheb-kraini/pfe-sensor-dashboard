import { useState } from "react";
import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
import { useDebounce } from "use-debounce";
import { useAdminStats } from "../../hooks/useAdminStats";
import type { UserRole } from "../../types/user.types";
import { useUsers } from "../../hooks/useusers";
import { StatsCards } from "../../components/stats/statscards";
import { UserFilters, UsersTable } from "../../components/Users/usersTable";
import { useUserModal } from "../../hooks/useUserModal";
import { UserFormModal } from "../../components/Users/UserFormModal";

export function AdminPage() {
  const stats = useAdminStats();
  const { open, openCreate, onClose } = useUserModal();
  // filters
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [isActive, setIsActive] = useState<boolean | "">("");
  const [debouncedSearch] = useDebounce(search, 400);

  const filters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(role && { role }),
    ...(isActive !== "" && { isActive }),
  };

  const hasFilters = !!debouncedSearch || !!role || isActive !== "";

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setIsActive("");
  };

  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useUsers(filters);

  return (
    <Box p={6}>
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg">Admin Panel</Heading>
        <Text color="gray.500" fontSize="sm" mt={1}>
          System overview and user management
        </Text>
      </Box>

      {/* Stats */}
      <StatsCards
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        totalDevices={stats.totalDevices}
        onlineDevices={stats.onlineDevices}
        totalAlerts={stats.totalAlerts}
        isLoading={stats.isLoading}
      />

      {/* Users section */}
      <Box
        bg="white"
        rounded="xl"
        borderWidth="1px"
        borderColor="gray.100"
        shadow="sm"
        p={5}
      >
        <HStack justify="space-between" mb={6}>
          <Heading size="md" mb={4}>
            Users
          </Heading>
          <Button colorPalette="blue" onClick={openCreate}>
            + New User
          </Button>
        </HStack>

        <UserFilters
          search={search}
          role={role}
          isActive={isActive}
          hasFilters={hasFilters}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onIsActiveChange={setIsActive}
          onReset={resetFilters}
        />

        <UsersTable
          data={data?.data}
          isLoading={isLoading}
          isError={isError}
          page={page}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </Box>
      <UserFormModal open={open} onClose={onClose} />
    </Box>
  );
}
