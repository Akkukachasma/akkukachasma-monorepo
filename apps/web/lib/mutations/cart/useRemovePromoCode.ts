import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemovePromoCode = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(ENDPOINTS.cart.coupon);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message || "Product added to cart",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.fetch_items] });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.checkout_preview] });
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
export default useRemovePromoCode;
