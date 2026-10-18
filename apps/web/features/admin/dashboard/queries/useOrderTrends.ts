import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface OrderTrend {
  date: string;
  count: number;
  revenue: number;
  statuses: {
    initiated: number;
    confirmed: number;
    picked: number;
    delivered: number;
    cancelled: number;
  };
}

const useOrderTrends = (period: "week" | "month" | "year" = "month") => {
  const api = getApiClient();

  return useQuery<OrderTrend[]>({
    queryKey: ["order-trends", period],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.dashboard.order_trends(period),
      );
      return response.data.data;
    },
  });
};

export default useOrderTrends;
