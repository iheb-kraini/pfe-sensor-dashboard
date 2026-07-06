import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useQueryClient } from "@tanstack/react-query";

export function ProtectedRoute() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  if (!(user && user.exp > Date.now() / 1000)) {
    console.log("log out !!");
    logout();
    queryClient.clear();
    return <Navigate to={"/login"} />;
  }
  return <Outlet />;
}
