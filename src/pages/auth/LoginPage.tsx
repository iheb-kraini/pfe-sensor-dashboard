import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLogin } from "../../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "../../schemas/auth.schema";

export function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  const serverError =
    // @ts-expect-error axios error shape
    error?.response?.data?.message ?? "Something went wrong, please try again";

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        bg="white"
        p={8}
        rounded="xl"
        shadow="md"
        w="full"
        maxW="400px"
      >
        <Stack gap={6}>
          <Stack gap={1}>
            <Heading size="xl">Welcome back</Heading>
            <Text color="gray.500" fontSize="sm">
              Sign in to your account
            </Text>
          </Stack>

          {isError && (
            <Box
              bg="red.50"
              color="red.600"
              px={4}
              py={3}
              rounded="md"
              fontSize="sm"
            >
              {serverError}
            </Box>
          )}

          <Stack gap={4}>
            <Field.Root invalid={!!errors.email}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                placeholder="you@example.com"
                disabled={isPending}
                {...register("email")}
              />
              <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("password")}
              />
              <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
            </Field.Root>
          </Stack>

          <Button
            type="submit"
            colorPalette="blue"
            loading={isPending}
            w="full"
          >
            Sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
