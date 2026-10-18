import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import {
  OrderAddress,
  OrderItem,
  OrderPayment,
  OrderPricing,
  OrderUser,
} from "./useGetOrders";

export interface OrderShipmentDetails {
  id: string;
  order_id: string;
  waybill_number?: string | null;
  tracking_url?: string | null;
  delivery_partner?: string | null;
  estimated_delivery?: string | null;
  actual_delivery?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  status: "initiated" | "cancelled" | "confirmed" | "picked" | "delivered";
  notes?: string;
  source?: string;
  cancelled_at?: string;
  confirmed_at?: string;
  picked_at?: string;
  delivered_at?: string;
  user: OrderUser;
  address?: OrderAddress;
  pricing: OrderPricing;
  payment?: OrderPayment;
  order_items: OrderItem[];
  shipment_details?: OrderShipmentDetails | null;
  invoice?: {
    id: string;
    status: "unpaid" | "paid" | "void";
    invoice_number?: string;
  } | null;
}

export type UseGetOrderOptions = {
  /** When false, the query does not run. Defaults to true when orderId is set. */
  enabled?: boolean;
};

const useGetOrder = (orderId: string, options?: UseGetOrderOptions) => {
  const api = getApiClient();
  const enabled =
    !!orderId && (options?.enabled !== undefined ? options.enabled : true);

  return useQuery<Order>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.orders.fetch_single(orderId),
      );
      return response.data.data;
    },
    enabled,
    refetchInterval: (query) => {
      const order = query.state.data as Order | undefined;
      if (!order) return false;
      if (order.status === "delivered" || order.status === "cancelled")
        return false;
      return 60_000;
    },
  });
};

export default useGetOrder;
