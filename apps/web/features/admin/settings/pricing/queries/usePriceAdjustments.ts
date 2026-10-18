import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

export type PriceAdjustmentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type PriceAdjustmentBatch = {
  id: string;
  created_at: string;
  direction: "increase" | "decrease";
  mode: "percentage" | "fixed";
  value: number;
  /** Older audit rows may omit status; treat as completed. */
  status?: PriceAdjustmentStatus | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  products_total: number;
  products_updated: number;
  products_clamped: number;
  products_skipped: number;
  notes?: string | null;
  created_by?: { id: string; name: string; email: string } | null;
};

export type PriceAdjustmentsListResponse = {
  data: PriceAdjustmentBatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const IN_PROGRESS: PriceAdjustmentStatus[] = ["pending", "processing"];

export function resolvePriceAdjustmentStatus(
  row: Pick<PriceAdjustmentBatch, "status">,
): PriceAdjustmentStatus {
  return row.status ?? "completed";
}

export function hasInProgressPriceAdjustment(
  items: PriceAdjustmentBatch[] | undefined,
): boolean {
  return (items ?? []).some((row) =>
    IN_PROGRESS.includes(resolvePriceAdjustmentStatus(row)),
  );
}

const usePriceAdjustments = (page = 1, limit = 20) => {
  const api = getApiClient();
  return useQuery({
    queryKey: ["admin-product-price-adjustments", page, limit],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      }).toString();
      const res = await api.get(
        ENDPOINTS.admin.products.price_adjustments.list(qs),
      );
      return res.data.data as PriceAdjustmentsListResponse;
    },
    refetchInterval: (query) => {
      const rows = query.state.data?.data;
      if (hasInProgressPriceAdjustment(rows)) return 2000;
      return false;
    },
  });
};

export default usePriceAdjustments;
