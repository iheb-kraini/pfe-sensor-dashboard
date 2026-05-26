import {
  Badge,
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  NativeSelect,
  Skeleton,
  Table,
  Text,
  TooltipArrow,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from "@chakra-ui/react";
import { LuPower, LuSearch } from "react-icons/lu";
import type { User, UserRole } from "../../types/user.types";
import { useActivateUser, useDeactivateUser } from "../../hooks/useusers";

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
    <Box bg="white" shadow="sm" rounded="xl" p={6} mb={6}>
      <HStack gap={4} flexWrap="wrap">
        <InputGroup startElement={<LuSearch size={16} />} maxW="240px">
          <Input
            placeholder="Search by name or email ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>

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
          <Button
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={onReset}
          >
            Clear filters
          </Button>
        )}
      </HStack>
    </Box>
  );
}

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

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Name
            </Table.ColumnHeader>
            <Table.ColumnHeader
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Email
            </Table.ColumnHeader>
            <Table.ColumnHeader
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Role
            </Table.ColumnHeader>
            <Table.ColumnHeader
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Joined
            </Table.ColumnHeader>
            <Table.ColumnHeader
              textAlign="center"
              fontWeight="semibold"
              color="muted.500"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Actions
            </Table.ColumnHeader>
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
                color="muted.400"
              >
                No users found
              </Table.Cell>
            </Table.Row>
          ) : (
            data?.map((user) => (
              <Table.Row key={user.id} _hover={{ bg: "muted.50" }}>
                <Table.Cell fontWeight="medium" color="muted.900">
                  {user.firstName} {user.lastName}
                </Table.Cell>
                <Table.Cell color="muted.500" fontSize="sm">
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
                <Table.Cell color="muted.500" fontSize="sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <TooltipRoot>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={
                          user.isActive ? "Deactivate user" : "Activate user"
                        }
                        colorPalette={user.isActive ? "red" : "green"}
                        loading={isToggling}
                        onClick={() =>
                          user.isActive
                            ? deactivate(user.id)
                            : activate(user.id)
                        }
                      >
                        <LuPower size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipPositioner>
                      <TooltipContent>
                        <TooltipArrow />
                        {user.isActive ? "Deactivate" : "Activate"}
                      </TooltipContent>
                    </TooltipPositioner>
                  </TooltipRoot>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {totalPages > 1 && (
        <HStack justify="center" mt={6} gap={3}>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            onClick={onPrevPage}
          >
            Previous
          </Button>
          <Text fontSize="sm" color="muted.500">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="ghost"
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
