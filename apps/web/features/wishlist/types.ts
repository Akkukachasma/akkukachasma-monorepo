import type { ISeparatedProduct } from "@/lib/types";

export interface IWishlistRow {
  wishlist_id: string;
  wishlisted_at: string | null;
  item: ISeparatedProduct;
}
