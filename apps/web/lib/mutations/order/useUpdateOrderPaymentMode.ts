import { getApiClient, getErrorMessage, RequestError, isPincodeServiceabilityUnavailable } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UpdateOrderPaymentModePayload = {
  payment_mode: "cod" | "online";
  acknowledge_unverified_pincode?: boolean;
};

const useUpdateOrderPaymentMode = (order_id: string) => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderPaymentModePayload) => {
      const response = await api.put(
        ENDPOINTS.checkout.update_payment_mode(order_id),
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
export default useUpdateOrderPaymentMode;
