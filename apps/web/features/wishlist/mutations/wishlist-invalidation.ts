import type { QueryClient } from "@tanstack/react-query";
import { WISHLIST_QUERY_KEY } from "../query-keys";

/** Wishlist changes affect listing `is_wishlisted` flags (see useSeparatedProducts query key). */
export function invalidateWishlistRelatedQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["separated-products"] });
}
