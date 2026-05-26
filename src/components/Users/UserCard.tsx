import {
  Badge,
  Box,
  Button,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { User } from "../../types/user.types";
import { useActivateUser, useDeactivateUser } from "../../hooks/useusers";

interface UserCardsProps {
  data: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function UserCards({
  data,
  isLoading,
  isError,
  page,
  totalPages,
  onNextPage,
  onPrevPage,
}: UserCardsProps) {
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

      {isLoading ? (
        <VStack gap={3}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} h="110px" w="100%" rounded="lg" />
          ))}
        </VStack>
      ) : data?.length === 0 ? (
        <Box textAlign="center" py={10} color="muted.400" fontSize="sm">
          No users found
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {data?.map((user) => (
            <Box
              key={user.id}
              rounded="lg"
              p={5}
              bg="white"
              shadow="sm"
              transition="all 0.2s"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
            >
              <HStack justify="space-between" mb={1}>
                <Text fontWeight="semibold" fontSize="sm" truncate color="muted.900">
                  {user.firstName} {user.lastName}
                </Text>
                <Badge
                  colorPalette={user.isActive ? "green" : "red"}
                  flexShrink={0}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </HStack>

              <Text fontSize="xs" color="muted.500" mb={3} truncate>
                {user.email}
              </Text>

              <HStack justify="space-between" align="center">
                <HStack gap={2}>
                  <Badge
                    colorPalette={user.role === "admin" ? "purple" : "blue"}
                    textTransform="capitalize"
                  >
                    {user.role}
                  </Badge>
                  <Text fontSize="xs" color="muted.400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>

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
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

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
