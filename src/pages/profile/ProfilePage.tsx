import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Field,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/auth.store";
import { useUpdateProfile } from "../../hooks/useusers";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "../../schemas/user.schema";
import { PushToggle } from "../../components/notifications/PushToggle";
import { LuShield, LuUser, LuPencil } from "react-icons/lu";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" },
  });

  if (!user) return null;

  const onSubmit = (values: UpdateProfileFormValues) => {
    updateProfile(values, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Center>
      <Box maxW="520px" w="full">
        <Heading size="xl" fontWeight="extrabold" mb={6} color="muted.900">
          Profile
        </Heading>
        <Card.Root overflow="hidden" shadow="sm">
          <Box h="3px" bg="accent" />
          <Card.Body>
            <Stack gap={6}>
              <HStack gap={4}>
                <Avatar.Root size="xl">
                  <Avatar.Fallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Stack gap={1} flex={1}>
                  <Text fontWeight="bold" fontSize="lg" color="muted.900">
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
                {!editing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={() => setEditing(true)}
                  >
                    <LuPencil size={16} />
                    <Text ml={1}>Edit</Text>
                  </Button>
                )}
              </HStack>

              {editing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack gap={4}>
                    <Field.Root invalid={!!errors.firstName}>
                      <Field.Label>First Name</Field.Label>
                      <Input {...register("firstName")} />
                      <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.lastName}>
                      <Field.Label>Last Name</Field.Label>
                      <Input {...register("lastName")} />
                      <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Email</Field.Label>
                      <Input value={user.email} disabled />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Account Status</Field.Label>
                      <Badge colorPalette={user.isActive ? "green" : "red"} w="fit-content">
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Field.Root>

                    <HStack gap={3} justify="flex-end" pt={2}>
                      <Button variant="ghost" onClick={handleCancel} disabled={isPending}>
                        Cancel
                      </Button>
                      <Button type="submit" colorPalette="blue" loading={isPending}>
                        Save Changes
                      </Button>
                    </HStack>
                  </Stack>
                </form>
              ) : (
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
              )}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root overflow="hidden" shadow="sm" mt={6}>
          <Box h="3px" bg="accent" />
          <Card.Body>
            <Heading size="md" mb={4}>
              Notifications
            </Heading>
            <PushToggle />
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
      borderColor="muted.100"
    >
      <Text fontSize="sm" color="muted.500" fontWeight="medium">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="muted.900">
        {value}
      </Text>
    </HStack>
  );
}
