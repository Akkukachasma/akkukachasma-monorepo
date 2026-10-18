import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface TodaysOrder {
  id: string;
  created_at: string;
  status: string;
  user: {
    id: string;
    name: string;
    avatar?: string | { url?: string };
  };
  pricing: {
    total: number;
  };
  payment?: {
    status: string;
    mode: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
  }>;
}

const useTodaysOrders = () => {
  const api = getApiClient();

  return useQuery<TodaysOrder[]>({
    queryKey: ["todays-orders"],
    queryFn: async () => {
      const response = await api.get(ENDPOINTS.admin.dashboard.todays_orders);
      return response.data.data;
    },
  });
};

export default useTodaysOrders;
