import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "../store/orders.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";

export interface OrderItemTax {
  id?: string;
  name?: string;
  tax_type?: string;
  tax_rate?: number;
  tax_amount?: number;
}

export interface OrderItem {
  id: string;
  product_color: any;
  power_type: any;
  lens_feature: any;
  lens_detail: any;
  frame_only: boolean;
  prescription?: any;
  quantity: number;
  price: number;
  discount: number;
  taxes?: OrderItemTax[];
  admin_cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderPayment {
  id: string;
  status: "pending" | "failed" | "completed";
  mode: "online" | "cod";
  transaction_id?: string;
  provider?: string;
  paid_at?: string;
  signature?: string;
}

export interface OrderPricing {
  id: string;
  base_subtotal: number;
  subtotal: number;
  discount_on_mrp: number;
  lens_detail_price: number;
  shipping_price: number;
  applied_coupon?: any;
  total: number;
}

export interface OrderUser {
  id: string;
  name: string;
  avatar?: string;
  phone_number?: string | null;
  email?: string | null;
}

export interface OrderAddress {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string | null;
  label?: string | null;
  notes?: string | null;
}

export interface OrderShipmentDetails {
  id: string;
  order_id: string;
  waybill_number?: string | null;
  tracking_url?: string | null;
  delivery_partner?: string | null;
  estimated_delivery?: string | null;
  actual_delivery?: string | null;
  created_at?: string;
  updated_at?: string;
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
  /** Present when admin list/detail includes invoice; null if no invoice exists yet. */
  invoice?: {
    id: string;
    status: "unpaid" | "paid" | "void";
    invoice_number?: string;
  } | null;
}

export interface UseGetOrdersParams {
  page: number;
  pageSize?: number;
}

type OrderSearchType =
  | "phone"
  | "orderId"
  | "paymentId"
  | "transactionId"
  | "generic";

const detectSearchType = (query: string): OrderSearchType => {
  const trimmed = query.trim();
  if (/^\d{10}$/.test(trimmed)) return "phone";
  if (/^[a-f\d]{24}$/i.test(trimmed)) return "orderId";
  const normalized = trimmed.toLowerCase();
  /** Razorpay: `order_…`; spec/example: `ord_…`. */
  if (normalized.startsWith("order_") || normalized.startsWith("ord_")) {
    return "orderId";
  }
  if (normalized.startsWith("pay_")) return "paymentId";
  if (normalized.startsWith("txn_")) return "transactionId";
  return "generic";
};

const useGetOrders = ({ page, pageSize = 10 }: UseGetOrdersParams) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const {
    total,
    search_term,
    sort_by,
    status,
    payment_status,
    payment_mode,
    start_date,
    end_date,
  } = useAppSelector((state) => state.ordersStore.data);
  const normalizedSearch = search_term.trim();
  const searchType = normalizedSearch
    ? detectSearchType(normalizedSearch)
    : undefined;

  const result = useQuery({
    queryKey: [
      "admin-orders",
      normalizedSearch,
      searchType,
      sort_by,
      status,
      payment_status,
      payment_mode,
      start_date,
      end_date,
      page,
      pageSize,
    ],
    queryFn: async () => {
      const filterObj = {
        page: String(page),
        page_size: String(pageSize),
        search_term: normalizedSearch,
        search: normalizedSearch,
        type: searchType,
        sort_by,
        status,
        payment_status,
        payment_mode,
        start_date,
        end_date,
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.orders.fetch_all(queryString),
      );

      if (response?.data?.total !== undefined) {
        dispatch(setTotal(response.data.total));
      }
      return response.data.data as Order[];
    },
    placeholderData: keepPreviousData,
  });

  return {
    data: result.data ?? [],
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
    total,
  };
};

export default useGetOrders;
