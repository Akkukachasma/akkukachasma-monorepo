import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { adminNotificationsQueryKey } from "../queries/useNotifications";
import { toast } from "@/lib/hooks/use-toast";

async function refetchAdminNotifications(
  qc: ReturnType<typeof useQueryClient>,
) {
  await qc.refetchQueries({
    queryKey: [...adminNotificationsQueryKey],
    type: "active",
  });
}

export function useMarkAllAdminNotificationsRead() {
  const api = getApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post(ENDPOINTS.admin.manage_notifications.read_all, {});
    },
    onSuccess: async () => {
      await refetchAdminNotifications(qc);
    },
    onError: (error: RequestError) => {
      void refetchAdminNotifications(qc);
      toast({
        title: "Could not mark notifications read",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useMarkAdminNotificationRead() {
  const api = getApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(ENDPOINTS.admin.manage_notifications.read(id));
    },
    onSuccess: async () => {
      // Refetch unread list so the panel tops back up to 20
      await refetchAdminNotifications(qc);
    },
    onError: (error: RequestError) => {
      void refetchAdminNotifications(qc);
      toast({
        title: "Could not mark notification read",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
