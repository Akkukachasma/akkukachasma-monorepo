import useSessionStorage from "@/hooks/use-session-storage";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { PurchaseStore } from "../types";
import { purchaseSchema } from "../purchase.schema";

const useCheckout = () => {
  const api = getApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { removeValue: removePurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  return useMutation({
    mutationFn: async (data: z.infer<typeof purchaseSchema>) => {
      const response = await api.post(ENDPOINTS.checkout.direct_checkout, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message || "Product added to cart",
        variant: "success",
      });
      removePurchaseStore();
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.checkout.fetch_checkout_details],
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.cart.fetch_items],
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.cart.checkout_preview],
      });
      router.replace("/checkout");
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
export default useCheckout;
