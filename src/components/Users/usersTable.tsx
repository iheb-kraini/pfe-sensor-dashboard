import {
  Badge,
  Box,
  Button,
  HStack,
  Input,
  NativeSelect,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import type { User, UserRole } from "../../types/user.types";
import { useActivateUser, useDeactivateUser } from "../../hooks/useusers";

// ── Filters bar ───────────────────────────────────────────────────────────────

interface FiltersProps {
  search: string;
  role: UserRole | "";
  isActive: boolean | "";
  hasFilters: boolean;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: UserRole | "") => void;
  onIsActiveChange: (v: boolean | "") => void;
  onReset: () => void;
}

export function UserFilters({
  search,
  role,
  isActive,
  hasFilters,
  onSearchChange,
  onRoleChange,
  onIsActiveChange,
  onReset,
}: FiltersProps) {
  return (
    <HStack mb={4} gap={3} flexWrap="wrap">
      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        maxW="240px"
      />

      <NativeSelect.Root maxW="140px">
        <NativeSelect.Field
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "")}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <NativeSelect.Root maxW="150px">
        <NativeSelect.Field
          value={isActive === "" ? "" : String(isActive)}
          onChange={(e) => {
            const v = e.target.value;
            onIsActiveChange(v === "" ? "" : v === "true");
          }}
        >
          <option value="">All users</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {hasFilters && (
        <Button size="sm" variant="ghost" colorPalette="red" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </HStack>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface TableProps {
  data: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function UsersTable({
  data,
  isLoading,
  isError,
  page,
  totalPages,
  onNextPage,
  onPrevPage,
}: TableProps) {
  const { mutate: activate, isPending: isActivating } = useActivateUser();
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUser();
  const isToggling = isActivating || isDeactivating;

  return (
    <>
      {isError && (
        <Box bg="red.50" color="red.600" px={4} py={3} rounded="md" mb={4}>
          Failed to load users. Please try again.
        </Box>
      )}

      <Table.Root variant="outline" rounded="md">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Joined</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Table.Row key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <Table.Cell key={j}>
                    <Skeleton h="20px" rounded="md" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : data?.length === 0 ? (
            <Table.Row>
              <Table.Cell
                colSpan={6}
                textAlign="center"
                py={8}
                color="gray.400"
              >
                No users found
              </Table.Cell>
            </Table.Row>
          ) : (
            data?.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell fontWeight="medium">
                  {user.firstName} {user.lastName}
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {user.email}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={user.role === "admin" ? "purple" : "blue"}
                    textTransform="capitalize"
                  >
                    {user.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={user.isActive ? "green" : "red"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette={user.isActive ? "red" : "green"}
                    loading={isToggling}
                    onClick={() =>
                      user.isActive ? deactivate(user.id) : activate(user.id)
                    }
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <HStack justify="center" mt={4} gap={2}>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={onPrevPage}
          >
            Previous
          </Button>
          <Text fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={onNextPage}
          >
            Next
          </Button>
        </HStack>
      )}
    </>
  );
}
