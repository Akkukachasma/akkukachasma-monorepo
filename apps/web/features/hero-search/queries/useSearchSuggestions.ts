import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

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

const fetchSearchSuggestions = async (
  q: string,
  limit = 14
): Promise<SearchSuggestion[]> => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.products.search_suggestions, {
    params: { q: q.trim(), limit },
  });
  return response?.data?.data ?? [];
};

import { HERO_SEARCH_QUERY_KEYS } from "../query-keys";

export function useSearchSuggestions(query: string, enabled = true) {
  const trimmedQuery = query?.trim() ?? "";
  const shouldFetch =
    enabled && trimmedQuery.length >= 2;

  return useQuery({
    queryKey: HERO_SEARCH_QUERY_KEYS.searchSuggestions(trimmedQuery),
    queryFn: () => fetchSearchSuggestions(trimmedQuery),
    enabled: shouldFetch,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
