import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { setItemToDelete } from "@/store/cart.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemoveProductFromCart = () => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const cart_item_id = useAppSelector(
    (store) => store.cartStore.itemToDelete?.id,
  );
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(
        ENDPOINTS.cart.remove_product(cart_item_id || ""),
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message || "Product added to cart",
        variant: "success",
      });
      dispatch(setItemToDelete(null));
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.fetch_items] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.cart.checkout_preview],
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
