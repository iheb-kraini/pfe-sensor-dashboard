import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  NativeSelect,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "../../schemas/user.schema";
import { useRegisterUser } from "../../hooks/useusers";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UserFormModal({ open, onClose }: Props) {
  const { mutate: register, isPending } = useRegisterUser();

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    register(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create User</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.firstName}>
                    <Field.Label>First Name</Field.Label>
                    <Input
                      placeholder="Gabrielle"
                      {...registerField("firstName")}
                    />
                    <Field.ErrorText>
                      {errors.firstName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.lastName}>
                    <Field.Label>Last Name</Field.Label>
                    <Input
                      placeholder="Martenille"
                      {...registerField("lastName")}
                    />
                    <Field.ErrorText>
                      {errors.lastName?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>Email</Field.Label>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...registerField("email")}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>Password</Field.Label>
                    <Input
                      type="password"
                      placeholder="Password@123"
                      {...registerField("password")}
                    />
                    <Field.ErrorText>
                      {errors.password?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.role}>
                    <Field.Label>Role</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...registerField("role")}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Field.ErrorText>{errors.role?.message}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" colorPalette="blue" loading={isPending}>
                  Create
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
