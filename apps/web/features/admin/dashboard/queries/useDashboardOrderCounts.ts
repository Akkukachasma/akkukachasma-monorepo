import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface DashboardOrderCounts {
  today: number;
  month: number;
  year: number;
}

export default function useDashboardOrderCounts() {
  const api = getApiClient();
  return useQuery<DashboardOrderCounts>({
    queryKey: ["dashboard", "cards", "order-counts"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.admin.dashboard.cards.order_counts);
      return res.data.data;
    },
  });
}
