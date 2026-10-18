"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { generateQueryString } from "@/lib/utils";
import type {
  IProductResultFilters,
  ISearchParams,
} from "@/store/product-results.slice";
import type { ICategoryProductFilters } from "@/lib/types";

function buildFilterParams(
  endpoint: string,
  pendingFilters: IProductResultFilters,
  initialSearchParams?: ISearchParams
): Record<string, string | number | string[] | undefined> {
  const isSearch = endpoint.includes("/search");
  const params: Record<string, string | number | string[] | undefined> = {
    page: 1,
    page_size: 1,
    ...(pendingFilters.shape_ids?.length
      ? { shape_ids: pendingFilters.shape_ids }
      : {}),
    ...(pendingFilters.color_ids?.length
      ? { color_ids: pendingFilters.color_ids }
      : {}),
    ...(pendingFilters.frame_width?.length
      ? { frame_width: pendingFilters.frame_width.map(String) }
      : {}),
    ...(pendingFilters.lens_width?.length
      ? { lens_width: pendingFilters.lens_width.map(String) }
      : {}),
    ...(pendingFilters.frame_size?.length
      ? { frame_size: pendingFilters.frame_size }
      : {}),
  };

  if (isSearch && initialSearchParams) {
    if (initialSearchParams.search)
      params.search = initialSearchParams.search;
    if (initialSearchParams.category_slug)
      params.category_slug = initialSearchParams.category_slug;
    if (initialSearchParams.shape_slug)
      params.shape_slug = initialSearchParams.shape_slug;
    if (initialSearchParams.gender)
      params.gender = [initialSearchParams.gender];
  }

  return params;
}

export function useFetchAvailableFilters(
  endpoint: string,
  pendingFilters: IProductResultFilters,
  initialSearchParams?: ISearchParams,
  enabled = true
) {
  const api = getApiClient();
  const params = buildFilterParams(endpoint, pendingFilters, initialSearchParams);
  const queryString = generateQueryString(params);

  return useQuery<ICategoryProductFilters>({
    queryKey: [
      "available-filters",
      endpoint,
      JSON.stringify(pendingFilters),
      JSON.stringify(initialSearchParams ?? {}),
    ],
    queryFn: async () => {
      const url = endpoint.includes("?")
        ? `${endpoint}&${queryString}`
        : `${endpoint}?${queryString}`;
      const response = await api.get(url);
      return response.data?.filters ?? {};
    },
    enabled: enabled,
  });
}
