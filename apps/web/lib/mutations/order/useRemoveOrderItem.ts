import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { setItemToDelete } from "@/store/checkout.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type RemoveItemApiResponse = {
  success?: boolean;
  message?: string;
  data?: { order_cleared?: boolean };
};

const useRemoveOrderItem = () => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const order_item_id = useAppSelector(
    (store) => store.checkoutStore.itemToDelete?.id,
  );
  const order_id = useAppSelector(
    (store) => store.checkoutStore.itemToDelete?.data?.id || "",
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(
        ENDPOINTS.checkout.remove_order_item(
          order_id || "",
          order_item_id || "",
        ),
      );

      return response.data as RemoveItemApiResponse;
    },
    onSuccess: (data) => {
      toast({
        description: data.message || "Product removed from order",
        variant: "success",
      });
      dispatch(setItemToDelete(null));

      if (data.data?.order_cleared) {
        queryClient.removeQueries({
          queryKey: [ENDPOINTS.checkout.fetch_checkout_details],
        });
        queryClient.invalidateQueries({
          queryKey: [ENDPOINTS.cart.fetch_items],
        });
        router.replace("/cart");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.checkout.fetch_checkout_details],
      });
    },
    onError: (error: RequestError) => {
      console.log("see this", error);
      const message = getErrorMessage(error);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
};
export default useRemoveOrderItem;
