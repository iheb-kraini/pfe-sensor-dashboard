import type {
  CreateUserPayload,
  User,
  UserQuery,
  UsersResponse,
} from "../../types/user.types";
import { api } from "../axios";

export const usersApi = {
  findAll: (query?: UserQuery) =>
    api.get<UsersResponse>("/users", { params: query }).then((res) => res.data),

  activate: (id: number) =>
    api.patch<User>(`/users/${id}/activate`).then((res) => res.data),

  deactivate: (id: number) =>
    api.patch<User>(`/users/${id}/deactivate`).then((res) => res.data),
  register: (payload: CreateUserPayload) =>
    api.post<User>("/auth/register", payload).then((res) => res.data),
};
