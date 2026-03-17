import { Navigate, Outlet } from "react-router-dom";
import { tokenStorage } from "../../utils/token";

export function ProtectedRoute() {
  const token = tokenStorage.getAccess();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
