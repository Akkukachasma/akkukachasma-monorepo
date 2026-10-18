import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface GstInvoiceSummary {
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  total_gst_portion: number;
  other_tax_total: number;
  tax_total_all: number;
  rounded_by: number;
  is_intra_state: boolean;
}

export interface InvoiceItemTax {
  id: string;
  tax_name: string;
  tax_type: string;
  tax_rate: number;
  tax_amount: number;
  tax_description?: string;
}

export interface InvoiceItem {
  id: string;
  order_item_id?: string | null;
  cancelled_at?: string | null;
  stock_restored_at?: string | null;
  cancel_reason?: string | null;
  product_name: string;
  product_sku?: string;
  product_color?: any;
  power_type?: any;
  lens_feature?: any;
  lens_detail?: any;
  frame_only: boolean;
  unit_price: number;
  quantity: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  taxes: InvoiceItemTax[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  financial_year: string;
  sequence_number: number;
  status: "unpaid" | "paid" | "void";
  issued_date: string;
  paid_at?: string;
  voided_at?: string;
  notes?: string;
  terms_conditions?: string;
  subtotal: number;
  tax_total: number;
  gst_rounded_by?: number;
  gst_summary?: GstInvoiceSummary;
  discount_on_mrp_total: number;
  coupon_discount_total: number;
  shipping_total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  order: {
    created_at: string;
    updated_at: string;
    id: string;
    status:
      | "initiated"
      | "cancelled"
      | "confirmed"
      | "picked"
      | "delivered";
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      /** Customer mobile from registration / profile */
      phone_number?: string | null;
    };
    address?: {
      id: string;
      /** Street / full address line (Prisma `address`) */
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country?: string | null;
    };
    pricing: {
      subtotal: number;
      total: number;
      discount_on_mrp: number;
      shipping_price: number;
    };
  };
  invoice_items: InvoiceItem[];
}

export interface CompanyInfo {
  id: string;
  company_name: string;
  store_name: string;
  store_address: string;
  full_address: string;
  email: string;
  phone: string;
  website: string;
  gstin: string;
  cin?: string;
  pan?: string;
  signature?: string | null;
  created_at: string;
  updated_at: string;
  updated_by: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceWithCompanyInfo {
  invoice: Invoice;
  company_info: CompanyInfo;
}

const useGetInvoice = (orderId: string) => {
  const api = getApiClient();

  return useQuery<InvoiceWithCompanyInfo>({
    queryKey: ["invoice", orderId],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.invoices.fetch_by_order_with_company_info(orderId),
      );
      return response.data.data;
    },
    enabled: !!orderId,
  });
};

export default useGetInvoice;
