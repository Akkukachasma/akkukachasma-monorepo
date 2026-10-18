import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

export type OrderStatusValue =
  | "initiated"
  | "cancelled"
  | "confirmed"
  | "picked"
  | "delivered";

interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatusValue;
  remark?: string;
}

const useUpdateOrderStatus = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      remark,
    }: UpdateOrderStatusParams) => {
      const response = await api.put(
        ENDPOINTS.admin.orders.update_status(orderId),
        {
          status,
          remark,
        },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast({
        title: "Order status updated",
        description: `Status set to ${variables.status}.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-order", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice", variables.orderId],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Could not update order",
        description:
          err.response?.data?.message ||
          "Check permissions or valid status transition.",
        variant: "destructive",
      });
    },
  });
};

export default useUpdateOrderStatus;
