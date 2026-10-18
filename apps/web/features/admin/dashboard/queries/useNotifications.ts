import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { adminNotificationsQueryKey } from "@/features/notifications/query-keys";

export { adminNotificationsQueryKey };

export interface Notification {
  id: string;
  type: string;
  category?: string;
  severity?: string;
  title: string;
  message?: string | null;
  body?: string | null;
  data?: unknown;
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  readAt?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

export type UseNotificationsOptions = {
  unreadOnly?: boolean;
};

/** Panel default: 20 unread. Full page/dashboard pass their own take. */
export const ADMIN_NOTIFICATION_PANEL_TAKE = 20;

const useNotifications = (
  take = ADMIN_NOTIFICATION_PANEL_TAKE,
  options?: UseNotificationsOptions,
) => {
  const api = getApiClient();
  const unreadOnly = options?.unreadOnly ?? false;

  return useQuery<Notification[]>({
    queryKey: [
      ...adminNotificationsQueryKey,
      take,
      unreadOnly ? "unread" : "all",
    ],
    queryFn: async () => {
      const qs = new URLSearchParams({ take: String(take) });
      if (unreadOnly) qs.set("unread_only", "true");
      const response = await api.get(
        ENDPOINTS.admin.manage_notifications.list(qs.toString()),
      );
      return response.data.data;
    },
    // Keep panel/badge fresh for websocket-driven invalidation + post mark-read refetch
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export default useNotifications;
