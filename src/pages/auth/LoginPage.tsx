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
import { LuTriangleAlert, LuRadio } from "react-icons/lu";

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
      bg="#1a1d23"
    >
      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        bg="white"
        p={10}
        rounded="xl"
        shadow="xl"
        w="full"
        maxW="400px"
      >
        <Stack gap={6}>
          <Stack gap={3} align="center" mb={2}>
            <Box
              w="48px"
              h="48px"
              bg="accent"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
            >
              <LuRadio size={24} />
            </Box>
            <Stack gap={0} align="center">
              <Heading size="lg" color="muted.900" fontWeight="extrabold">
                RailMonitor
              </Heading>
              <Text color="muted.400" fontSize="sm">
                Sign in to your account
              </Text>
            </Stack>
          </Stack>

          {isError && (
            <Box
              bg="red.50"
              color="red.600"
              px={4}
              py={3}
              rounded="md"
              fontSize="sm"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <LuTriangleAlert size={16} />
              <Text>{serverError}</Text>
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
            size="lg"
          >
            Sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}