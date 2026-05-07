import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CreateUserPayload, UserQuery } from "../types/user.types";
import { usersApi } from "../api/endpoints/users.api";

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
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
