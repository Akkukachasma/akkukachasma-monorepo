import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

const useRevenueTrends = (period: "week" | "month" | "year" = "month") => {
  const api = getApiClient();

  return useQuery<RevenueTrend[]>({
    queryKey: ["revenue-trends", period],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.dashboard.revenue_trends(period),
      );
      return response.data.data;
    },
  });
};

export default useRevenueTrends;
