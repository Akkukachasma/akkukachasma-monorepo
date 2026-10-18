import useSessionStorage from "@/hooks/use-session-storage";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { PurchaseStore } from "../types";
import { purchaseSchema } from "../purchase.schema";

export type AddToCartOptions = {
  redirectTo?: "cart" | "checkout";
};

const useAddProductToCart = () => {
  const api = getApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { removeValue: removePurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  return useMutation({
    mutationFn: async (
      payload: z.infer<typeof purchaseSchema> & AddToCartOptions
    ) => {
      const { redirectTo: _r, ...data } = payload;
      const response = await api.post(ENDPOINTS.cart.add_product, data);
      return { response: response.data, redirectTo: payload.redirectTo };
    },
    onSuccess: async ({ response, redirectTo }) => {
      toast({
        description: response.message || "Product added to cart",
        variant: "success",
      });
      removePurchaseStore();
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.fetch_items] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.cart.checkout_preview],
      });
      await new Promise((r) => setTimeout(r, 100));
      if (redirectTo === "checkout") {
        window.location.href = "/checkout";
      } else {
        router.replace("/cart");
      }
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
export default useAddProductToCart;
