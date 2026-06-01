import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CreateUserPayload, UserQuery } from "../types/user.types";
import { usersApi } from "../api/endpoints/users.api";
import { toaster } from "../components/ui/toaster";

export const userKeys = {
  all: ["users"] as const,
  list: (query?: UserQuery) => [...userKeys.all, "list", query] as const,
};

const LIMIT = 10;

export function useUsers(filters: UserQuery = {}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.role, filters.isActive]);

  const query = { ...filters, page, limit: LIMIT };

  const result = useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.findAll(query),
  });

  const totalPages = result.data?.meta.totalPages ?? 1;

  return {
    ...result,
    page,
    totalPages,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toaster.create({ type: "success", title: "User activated" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to activate user";
      toaster.create({ type: "error", title });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toaster.create({ type: "success", title: "User deactivated" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to deactivate user";
      toaster.create({ type: "error", title });
    },
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toaster.create({ type: "success", title: "User created" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to create user";
      toaster.create({ type: "error", title });
    },
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usersApi.updatePassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toaster.create({ type: "success", title: "Password reset" });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      const title = Array.isArray(msg) ? msg[0] : msg ?? "Failed to reset password";
      toaster.create({ type: "error", title });
    },
  });
}
