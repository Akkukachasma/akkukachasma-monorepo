import { getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWishlistByProductColor } from "../wishlist.service";
import { invalidateWishlistRelatedQueries } from "./wishlist-invalidation";

const useRemoveWishlistByProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product_color_id: string) =>
      removeWishlistByProductColor(product_color_id),
    onSuccess: () => {
      invalidateWishlistRelatedQueries(queryClient);
    },
    onError: (error: RequestError) => {
      toast({
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
};

export default useRemoveWishlistByProduct;
