import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { IWishlistRow } from "./types";

export async function fetchWishlist(): Promise<IWishlistRow[]> {
  const res = await getApiClient().get(ENDPOINTS.wishlist.list);
  return res.data?.data ?? [];
}

export async function addToWishlist(params: {
  product_color_id: string;
}): Promise<void> {
  await getApiClient().post(ENDPOINTS.wishlist.add, params);
}

export async function removeWishlistByProductColor(
  product_color_id: string,
): Promise<void> {
  await getApiClient().delete(
    ENDPOINTS.wishlist.remove_by_product_color(product_color_id),
  );
}

export async function removeWishlistItem(wishlist_id: string): Promise<void> {
  await getApiClient().delete(ENDPOINTS.wishlist.remove(wishlist_id));
}

export async function clearWishlist(): Promise<void> {
  await getApiClient().delete(ENDPOINTS.wishlist.clear);
}
