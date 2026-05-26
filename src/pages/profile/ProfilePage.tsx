import {
  Avatar,
  Badge,
  Box,
  Card,
  Center,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAuthStore } from "../../store/auth.store";
import { LuShield, LuUser } from "react-icons/lu";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <Center>
      <Box maxW="520px" w="full">
        <Heading size="lg" mb={6}>
          Profile
        </Heading>
        <Card.Root variant="outline" position="relative" overflow="hidden">
          {/* Accent header bar */}
          <Box h="4px" bg="linear-gradient(90deg, blue.400, purple.400)" />
          <Card.Body>
            <Stack gap={6}>
              {/* Avatar + name */}
              <HStack gap={4}>
                <Avatar.Root size="xl">
                  <Avatar.Fallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Stack gap={1}>
                  <Text fontWeight="semibold" fontSize="lg">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Badge
                    colorPalette={user.role === "admin" ? "purple" : "blue"}
                    w="fit-content"
                    textTransform="capitalize"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    {user.role === "admin" ? <LuShield size={12} /> : <LuUser size={12} />}
                    {user.role}
                  </Badge>
                </Stack>
              </HStack>
              {/* Info rows */}
              <Stack gap={3}>
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="First Name" value={user.firstName} />
                <InfoRow label="Last Name" value={user.lastName} />
                <InfoRow
                  label="Account Status"
                  value={
                    <Badge colorPalette={user.isActive ? "green" : "red"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
              </Stack>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Box>
    </Center>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <HStack
      justify="space-between"
      py={2}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.500" fontWeight="medium">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium">
        {value}
      </Text>
    </HStack>
  );
}
