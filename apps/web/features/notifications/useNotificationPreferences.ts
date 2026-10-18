import { getApiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface NotificationPreferences {
  email: boolean;
  in_app: boolean;
  phone: boolean;
}

const queryKey = ["account", "notification-preferences"] as const;

export function useNotificationPreferences() {
  const api = getApiClient();
  return useQuery<NotificationPreferences>({
    queryKey: [...queryKey],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.account.notification_preferences);
      return res.data.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const api = getApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<NotificationPreferences>) => {
      const res = await api.put(ENDPOINTS.account.notification_preferences, patch);
      return res.data.data as NotificationPreferences;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...queryKey] });
    },
  });
}
