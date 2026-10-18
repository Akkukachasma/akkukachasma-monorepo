import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import type { PriceAdjustmentFormValues } from "../pricing.schema";

const useCreatePriceAdjustment = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PriceAdjustmentFormValues) => {
      const res = await api.post(
        ENDPOINTS.admin.products.price_adjustments.create,
        {
          direction: payload.direction,
          mode: payload.mode,
          value: payload.value,
          notes: payload.notes?.trim() || undefined,
        },
      );
      return res.data.data as {
        adjustment_id: string;
        status: "pending" | "processing" | "completed" | "failed";
        products_total: number;
        products_updated: number;
        products_clamped: number;
        products_skipped: number;
      };
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-product-price-adjustments"],
      });
      toast({
        title: "Price adjustment started",
        description: `Updating ${data.products_total} product(s) in the background. History will refresh when finished.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Price adjustment failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Could not start product price adjustment.",
        variant: "destructive",
      });
    },
  });
};

export default useCreatePriceAdjustment;
