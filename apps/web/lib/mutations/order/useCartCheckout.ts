import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const useCartCheckout = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(ENDPOINTS.checkout.from_cart);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.fetch_items] });
      router.push("/checkout");
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
export default useCartCheckout;
