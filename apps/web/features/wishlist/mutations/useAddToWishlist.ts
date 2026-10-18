import { getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToWishlist } from "../wishlist.service";
import { invalidateWishlistRelatedQueries } from "./wishlist-invalidation";

const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { product_color_id: string }) => addToWishlist(params),
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

export default useAddToWishlist;
