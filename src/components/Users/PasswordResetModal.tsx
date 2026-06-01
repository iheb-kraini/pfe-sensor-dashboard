import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from "../../schemas/user.schema";
import { useUpdateUserPassword } from "../../hooks/useusers";

interface Props {
  open: boolean;
  userId: number;
  userName: string;
  onClose: () => void;
}

export function PasswordResetModal({ open, userId, userName, onClose }: Props) {
  const { mutate: updatePassword, isPending } = useUpdateUserPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: UpdatePasswordFormValues) => {
    updatePassword(
      { id: userId, password: values.password },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => !open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Reset Password</Dialog.Title>
              <Text fontSize="sm" color="muted.500" mt={1}>
                {userName}
              </Text>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>New Password</Field.Label>
                    <Input
                      type="password"
                      placeholder="Password@123"
                      {...register("password")}
                    />
                    <Field.ErrorText>
                      {errors.password?.message}
                    </Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorPalette="orange"
                  loading={isPending}
                >
                  Reset Password
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
