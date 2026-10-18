import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

export interface MyOrderItem {
  id: string;
  product_color: { model_number?: string };
  quantity: number;
  price: number;
}

export interface MyOrder {
  id: string;
  created_at: string;
  status: string;
  waybill_number?: string | null;
  tracking_url?: string | null;
  pricing: { total: number };
  order_items: MyOrderItem[];
}

interface MyOrdersResponse {
  data: MyOrder[];
  total: number;
  page: number;
  page_size: number;
}

const useGetMyOrders = (page = 1, pageSize = 10) => {
  const api = getApiClient();

  return useQuery<MyOrdersResponse>({
    queryKey: ["my-orders", page, pageSize],
    queryFn: async () => {
      const qs = `page=${page}&page_size=${pageSize}`;
      const res = await api.get(ENDPOINTS.orders.my_orders(qs));
      return res.data;
    },
  });
};

export default useGetMyOrders;
