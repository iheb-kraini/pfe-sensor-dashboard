import { api } from "../axios";

export const pushApi = {
  subscribe: (subscription: PushSubscriptionJSON) =>
    api.post("/push/subscribe", { subscription }),

  unsubscribe: () => api.delete("/push/unsubscribe"),
};
