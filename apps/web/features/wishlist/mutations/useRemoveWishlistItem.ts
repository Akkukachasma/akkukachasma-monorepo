import { getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeWishlistItem } from "../wishlist.service";
import { invalidateWishlistRelatedQueries } from "./wishlist-invalidation";

const useRemoveWishlistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wishlist_id: string) => removeWishlistItem(wishlist_id),
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

export default useRemoveWishlistItem;
