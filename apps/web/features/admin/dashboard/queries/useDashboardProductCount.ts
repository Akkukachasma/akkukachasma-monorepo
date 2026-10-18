import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface DashboardProductCount {
  total: number;
}

export default function useDashboardProductCount() {
  const api = getApiClient();
  return useQuery<DashboardProductCount>({
    queryKey: ["dashboard", "cards", "product-count"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.admin.dashboard.cards.product_count);
      return res.data.data;
    },
  });
}
