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
import { UserCards } from "../../components/Users/UserCard";
import { PasswordResetModal } from "../../components/Users/PasswordResetModal";

export function AdminPage() {
  const stats = useAdminStats();
  const { open, openCreate, onClose } = useUserModal();
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

  const [passwordResetTarget, setPasswordResetTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, page, totalPages, nextPage, prevPage } =
    useUsers(filters);

  return (
    <Box>
      <Box mb={6}>
        <Heading size="xl" fontWeight="extrabold" color="muted.900">Admin Panel</Heading>
        <Text color="muted.400" fontSize="sm" mt={1}>
          System overview and user management
        </Text>
      </Box>

      <StatsCards
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        totalDevices={stats.totalDevices}
        onlineDevices={stats.onlineDevices}
        totalAlerts={stats.totalAlerts}
        unreadAlerts={stats.unreadAlerts}
        isLoading={stats.isLoading}
      />

      <Box bg="white" rounded="xl" shadow="sm" p={6}>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg" fontWeight="bold" color="muted.900">Users</Heading>
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
        <Box display={{ base: "none", lg: "block" }}>
          <UsersTable
            data={data?.data}
            isLoading={isLoading}
            isError={isError}
            page={page}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onResetPassword={(id, name) => setPasswordResetTarget({ id, name })}
          />
        </Box>
        <Box display={{ base: "block", lg: "none" }}>
          <UserCards
            data={data?.data}
            isLoading={isLoading}
            isError={isError}
            page={page}
            totalPages={totalPages}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onResetPassword={(id, name) => setPasswordResetTarget({ id, name })}
          />
        </Box>
      </Box>
      <UserFormModal open={open} onClose={onClose} />
      <PasswordResetModal
        open={passwordResetTarget !== null}
        userId={passwordResetTarget?.id ?? 0}
        userName={passwordResetTarget?.name ?? ""}
        onClose={() => setPasswordResetTarget(null)}
      />
    </Box>
  );
}