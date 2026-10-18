import { getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearWishlist } from "../wishlist.service";
import { invalidateWishlistRelatedQueries } from "./wishlist-invalidation";

const useClearWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearWishlist(),
    onSuccess: () => {
      invalidateWishlistRelatedQueries(queryClient);
      toast({ description: "Wishlist cleared." });
    },
    onError: (error: RequestError) => {
      toast({
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
};

export default useClearWishlist;
