// Example helper function
import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    // Convert current time to seconds
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
