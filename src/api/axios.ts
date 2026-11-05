import axios from "axios";
import { tokenStorage } from "../utils/token";
import { useAuthStore } from "../store/auth.store";
import { env } from "../config/env";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (original.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${env.apiBaseUrl}/auth/refresh`,
          { refresh_token: refreshToken },
        );
        useAuthStore.getState().setTokens(data.access_token, refreshToken);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
