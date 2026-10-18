import { getApiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { customerNotificationsQueryKey } from "@/features/notifications/query-keys";

export interface CustomerNotification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  body?: string | null;
  timestamp: string;
  isRead: boolean;
  entityType?: string | null;
  entityId?: string | null;
}

export function useCustomerNotifications(take = 30) {
  const api = getApiClient();
  return useQuery<CustomerNotification[]>({
    queryKey: [...customerNotificationsQueryKey, take],
    queryFn: async () => {
      const qs = new URLSearchParams({ take: String(take) });
      const res = await api.get(ENDPOINTS.notifications.list(qs.toString()));
      return res.data.data;
    },
  });
}

export function useMarkCustomerNotificationRead() {
  const api = getApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(ENDPOINTS.notifications.read(id));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...customerNotificationsQueryKey] });
    },
  });
}

export function useMarkAllCustomerNotificationsRead() {
  const api = getApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post(ENDPOINTS.notifications.read_all);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...customerNotificationsQueryKey] });
    },
  });
}
