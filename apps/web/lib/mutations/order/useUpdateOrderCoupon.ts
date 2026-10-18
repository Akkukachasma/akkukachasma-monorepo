import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateOrderCoupon = (order_id: string) => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { coupon_code?: string }) => {
      const response = await api.put(
        ENDPOINTS.checkout.update_order_coupon(order_id),
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
      const message = getErrorMessage(error);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
};
export default useUpdateOrderCoupon;
