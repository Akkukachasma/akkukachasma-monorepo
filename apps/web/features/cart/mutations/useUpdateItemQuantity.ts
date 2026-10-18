import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import {
  quantityUpdateSettled,
  quantityUpdateStarted,
} from "@/store/cart.slice";

const useUpdateItemQuantity = (item_id: string) => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    onMutate: () => {
      dispatch(quantityUpdateStarted());
    },
    mutationFn: async (data: { quantity: number }) => {
      const response = await api.patch(
        ENDPOINTS.cart.update_item_quantity(item_id),
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.cart.fetch_items] });
    },
    onSettled: () => {
      dispatch(quantityUpdateSettled());
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
export default useUpdateItemQuantity;
