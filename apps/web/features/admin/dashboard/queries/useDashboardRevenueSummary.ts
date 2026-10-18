import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface DashboardRevenueSummary {
  today: number;
  month: number;
  year: number;
}

export default function useDashboardRevenueSummary() {
  const api = getApiClient();
  return useQuery<DashboardRevenueSummary>({
    queryKey: ["dashboard", "cards", "revenue-summary"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.admin.dashboard.cards.revenue_summary);
      return res.data.data;
    },
  });
}
