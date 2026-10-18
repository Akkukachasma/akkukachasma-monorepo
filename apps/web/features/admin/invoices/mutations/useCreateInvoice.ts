import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

const useCreateInvoice = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(
        ENDPOINTS.admin.invoices.create_from_order(orderId),
      );
      return response.data.data;
    },
    onSuccess: (data, orderId) => {
      toast({
        title: "Invoice Created",
        description: "Invoice has been successfully created from the order.",
      });

      // Invalidate and refetch invoice data
      queryClient.invalidateQueries({ queryKey: ["invoice", orderId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });
};

export default useCreateInvoice;
