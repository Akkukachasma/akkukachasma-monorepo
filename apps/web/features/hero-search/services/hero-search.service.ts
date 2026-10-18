import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { ICategoryProductsResponse, ISeparatedProduct } from "@/lib/types";
import { DEFAULT_PRODUCT_PAGE_SIZE } from "@/features/products/lib/parse-listing-query";
import type { ISearchParams } from "@/store/product-results.slice";
import { generateQueryString } from "@/lib/utils";

const api = getApiClient();

export type SearchSuggestion =
  | { type: 'category'; title: string; slug: string }
  | { type: 'shape'; title: string; slug: string }
  | { type: 'gender'; value: string; label: string }
  | {
      type: 'product';
      model_name: string;
      slug: string;
      model_number: string | null;
      image_url: string | null;
    };

export const fetchSearchSuggestions = async (
  q: string,
  limit = 10
): Promise<SearchSuggestion[]> => {
  if (!q || q.trim().length < 2) return [];
  const response = await api.get(ENDPOINTS.products.search_suggestions, {
    params: { q: q.trim(), limit },
  });
  return response?.data?.data ?? [];
};

export const fetchSearchProducts = async (
  searchParams: ISearchParams,
  extra?: { page?: number; page_size?: number; sort_by?: string }
): Promise<ICategoryProductsResponse<ISeparatedProduct>> => {
  const params: Record<string, string | number | string[] | undefined> = {
    page: 1,
    page_size: DEFAULT_PRODUCT_PAGE_SIZE,
    ...(searchParams.category_slug
      ? { category_slug: searchParams.category_slug }
      : {}),
    ...(searchParams.shape_slug
      ? { shape_slug: searchParams.shape_slug }
      : {}),
    ...(searchParams.gender ? { gender: [searchParams.gender] } : {}),
    ...(searchParams.search ? { search: searchParams.search } : {}),
    ...extra,
  };
  const queryString = generateQueryString(params);
  const response = await api.get(
    `${ENDPOINTS.products.search}?${queryString}`
  );
  return response?.data;
};
