import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { setItemToDelete } from "@/store/cart.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemoveProductFromCart = () => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cart_item_id: string) => {
      if (!cart_item_id) {
        throw new Error("Cart item ID is required");
      }
      const response = await api.delete(
        ENDPOINTS.cart.remove_product(cart_item_id),
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message || "Product added to cart",
        variant: "success",
      });
      dispatch(setItemToDelete(null));
      queryClient.refetchQueries({
        queryKey: [ENDPOINTS.cart.fetch_items],
        type: "all",
      });
      queryClient.refetchQueries({
        queryKey: [ENDPOINTS.cart.checkout_preview],
        type: "all",
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
export default useRemoveProductFromCart;
