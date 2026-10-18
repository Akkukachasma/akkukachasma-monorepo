import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { IShape } from "@/components/shapes/ListItem";
import { HERO_SEARCH_QUERY_KEYS } from "../query-keys";

const fetchShapesForHero = async (): Promise<IShape[]> => {
  const api = getApiClient();
  const response = await api.get(
    ENDPOINTS.admin.shapes.fetch_all("page_size=100")
  );
  return response?.data?.data ?? [];
};

export function useShapesForHero() {
  return useQuery({
    queryKey: HERO_SEARCH_QUERY_KEYS.shapes,
    queryFn: fetchShapesForHero,
    staleTime: 30_000,
    retry: 2,
  });
}
