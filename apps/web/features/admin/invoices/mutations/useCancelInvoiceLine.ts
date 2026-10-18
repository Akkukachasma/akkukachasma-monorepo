import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

export type CancelInvoiceLineInput = {
  orderId: string;
  invoiceId: string;
  itemId: string;
  reason?: string;
};

const useCancelInvoiceLine = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      itemId,
      reason,
    }: CancelInvoiceLineInput) => {
      const response = await api.post(
        ENDPOINTS.admin.invoices.cancel_line(invoiceId, itemId),
        reason ? { reason } : {},
      );
      return response.data.data;
    },
    onSuccess: (_data, { orderId }) => {
      toast({ title: "Line cancelled", description: "Invoice and order updated." });
      queryClient.invalidateQueries({ queryKey: ["invoice", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Could not cancel line",
        description:
          err.response?.data?.message ||
          "Check that this is not the last active line and the invoice is not void.",
        variant: "destructive",
      });
    },
  });
};

export default useCancelInvoiceLine;
