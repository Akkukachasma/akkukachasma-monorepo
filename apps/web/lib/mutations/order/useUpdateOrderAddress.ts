import { getApiClient, getErrorMessage, RequestError, isPincodeServiceabilityUnavailable } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateOrderAddressPayload = {
  address_id: string;
  acknowledge_unverified_pincode?: boolean;
};

const useUpdateOrderAddress = (order_id: string) => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderAddressPayload) => {
      const response = await api.put(
        ENDPOINTS.checkout.update_order_address(order_id),
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.checkout.fetch_checkout_details],
      });
    },
    onError: (error: RequestError) => {
      if (isPincodeServiceabilityUnavailable(error)) return;
      const message = getErrorMessage(error);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
};
export default useUpdateOrderAddress;
