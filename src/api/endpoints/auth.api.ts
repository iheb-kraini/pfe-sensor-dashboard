import { api } from "../axios";
import type {
  LoginDto,
  LoginResponse,
  RefreshResponse,
} from "../../types/auth.types";

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResponse>("/auth/login", dto).then((res) => ({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    })),

  refresh: (refreshToken: string) =>
    api
      .post<RefreshResponse>("/auth/refresh", { refresh_token: refreshToken })
      .then((res) => res.data),
};
