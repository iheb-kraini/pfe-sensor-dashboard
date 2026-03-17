import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { tokenStorage } from "../utils/token";
import type { JwtPayload } from "../types/auth.types";

interface AuthState {
  user: JwtPayload | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const resolveUser = (): JwtPayload | null => {
  const token = tokenStorage.getAccess();
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: resolveUser(),
  setTokens: (access, refresh) => {
    tokenStorage.setTokens(access, refresh);
    set({ user: jwtDecode<JwtPayload>(access) });
  },
  logout: () => {
    tokenStorage.clear();
    set({ user: null });
  },
  isAdmin: () => get().user?.role === "admin",
}));
