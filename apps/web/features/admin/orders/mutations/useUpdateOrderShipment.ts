import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

interface UpdateShipmentPayload {
  orderId: string;
  waybill_number: string;
  delivery_partner?: string;
  estimated_delivery?: string;
}

const useUpdateOrderShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      waybill_number,
      delivery_partner,
      estimated_delivery,
    }: UpdateShipmentPayload) => {
      const api = getApiClient();
      const res = await api.put(
        ENDPOINTS.admin.orders.update_shipment(orderId),
        { waybill_number, delivery_partner, estimated_delivery }
      );
      return res.data.data;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
    },
  });
};

export default useUpdateOrderShipment;
