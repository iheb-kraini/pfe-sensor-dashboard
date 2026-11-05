type RequiredEnvKey = "VITE_API_URL" | "VITE_VAPID_PUBLIC_KEY";

function requireEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Copy .env.example to .env.`,
    );
  }
  return value;
}

const apiBaseUrl = requireEnv("VITE_API_URL").replace(/\/+$/, "");

export const env = {
  apiBaseUrl,
  socketUrl:
    import.meta.env.VITE_SOCKET_URL?.trim() ||
    `${apiBaseUrl}/notifications`,
  vapidPublicKey: requireEnv("VITE_VAPID_PUBLIC_KEY"),
} as const;
