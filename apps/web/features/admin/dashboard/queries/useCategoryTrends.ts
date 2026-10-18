import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface CategoryTrend {
  name: string;
  orders: number;
  revenue: number;
  items: number;
}

const useCategoryTrends = (period: "week" | "month" | "year" = "month") => {
  const api = getApiClient();

  return useQuery<CategoryTrend[]>({
    queryKey: ["category-trends", period],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.dashboard.category_trends(period),
      );
      return response.data.data;
    },
  });
};

export default useCategoryTrends;
