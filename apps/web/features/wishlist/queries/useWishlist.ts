import { useQuery } from "@tanstack/react-query";
import { fetchWishlist } from "../wishlist.service";
import { WISHLIST_QUERY_KEY } from "../query-keys";

const useWishlist = () => {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: fetchWishlist,
  });
};

export default useWishlist;
