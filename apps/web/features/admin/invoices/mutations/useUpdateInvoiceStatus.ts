import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

export type InvoiceUiStatus = "unpaid" | "paid" | "void";

export type UpdateInvoiceStatusInput = {
  orderId: string;
  invoiceId: string;
  status: InvoiceUiStatus;
};

const useUpdateInvoiceStatus = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, status }: UpdateInvoiceStatusInput) => {
      const response = await api.post(
        ENDPOINTS.admin.invoices.update_status(invoiceId),
        { status },
      );
      return response.data.data;
    },
    onSuccess: (_data, { orderId }) => {
      toast({ title: "Invoice status updated" });
      queryClient.invalidateQueries({ queryKey: ["invoice", orderId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Could not update status",
        variant: "destructive",
      });
    },
  });
};

export default useUpdateInvoiceStatus;
