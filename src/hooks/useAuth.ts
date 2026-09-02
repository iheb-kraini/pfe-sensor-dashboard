import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints/auth.api";
import { useAuthStore } from "../store/auth.store";
import { toaster } from "../components/ui/toaster";

export function useLogin() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      navigate("/", { replace: true });
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Login failed";
      toaster.create({ type: "error", title: message });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear(); //clear rect query cach so when re log i don't see previous user data
    navigate("/login", { replace: true });
  };
}
