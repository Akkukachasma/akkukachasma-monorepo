import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface DashboardCategoryCount {
  total: number;
}

export default function useDashboardCategoryCount() {
  const api = getApiClient();
  return useQuery<DashboardCategoryCount>({
    queryKey: ["dashboard", "cards", "category-count"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.admin.dashboard.cards.category_count);
      return res.data.data;
    },
  });
}
