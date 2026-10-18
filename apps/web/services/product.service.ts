import { IProduct } from "@/components/products/ListItem";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { ISeparatedProduct } from "@/lib/types";

export const fetchShapeStarters = async () => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.products.shape_starters);
  return response.data.data;
};

type StorefrontListFetchOptions = { token?: string };

/** Pass `token` from `cookies()` when calling from a Server Component so `is_wishlisted` is correct. */
export const fetchLatestProducts = async (
  options?: StorefrontListFetchOptions,
): Promise<ISeparatedProduct[]> => {
  const api = getApiClient({ token: options?.token });
  const response = await api.get(ENDPOINTS.products.latest);
  return response.data.data;
};

export const fetchPopularProducts = async (
  options?: StorefrontListFetchOptions,
): Promise<ISeparatedProduct[]> => {
  const api = getApiClient({ token: options?.token });
  const response = await api.get(ENDPOINTS.products.popular);
  return response.data.data;
};

export const fetchFeaturedProducts = async (
  options?: StorefrontListFetchOptions,
): Promise<ISeparatedProduct[]> => {
  const api = getApiClient({ token: options?.token });
  const response = await api.get(ENDPOINTS.products.featured);
  return response.data.data;
};

export const fetchProductDetails = async (
  slug: string,
  options?: { model_number?: string; token?: string },
): Promise<IProduct> => {
  const api = getApiClient({ token: options?.token });
  const response = await api.get(
    ENDPOINTS.products.fetch_single_product(slug, options?.model_number),
  );
  return response.data.data;
};
