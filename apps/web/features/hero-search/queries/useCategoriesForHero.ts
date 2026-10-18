import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { ICategory } from "@/components/categories/ListItem";
import { HERO_SEARCH_QUERY_KEYS } from "../query-keys";

const fetchCategoriesForHero = async (): Promise<ICategory[]> => {
  const api = getApiClient();
  const response = await api.get(
    ENDPOINTS.admin.categories.fetch_all("page_size=100")
  );
  return response?.data?.data ?? [];
};

export function useCategoriesForHero() {
  return useQuery({
    queryKey: HERO_SEARCH_QUERY_KEYS.categories,
    queryFn: fetchCategoriesForHero,
    staleTime: 30_000,
    retry: 2,
  });
}
