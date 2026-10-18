import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";

export type ManifestOrdersResponse = {
  job_id: string;
  accepted: number;
  missing_order_ids?: string[];
};

const useManifestOrders = () => {
  const api = getApiClient();
  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const response = await api.post(ENDPOINTS.admin.orders.manifest, {
        order_ids: orderIds,
      });
      return response.data.data as ManifestOrdersResponse;
    },
    onError: (error: RequestError) => {
      toast({
        title: "Ready To Ship failed",
        description: getErrorMessage(error) || "Could not start manifestation.",
        variant: "destructive",
      });
    },
  });
};

export default useManifestOrders;
