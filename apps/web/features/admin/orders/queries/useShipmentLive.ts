import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface DelhiveryScan {
  Scan?: string;
  ScanDetail?: { ScannedAt?: string; Scan?: string };
  DetailedStatus?: { Status?: string };
}

export interface ShipmentLiveData {
  waybill_number: string | null;
  tracking_info: {
    Scans?: DelhiveryScan[];
    Shipment?: { Scans?: DelhiveryScan[] };
    ShipmentData?: { Status?: { Status?: string } };
    Status?: { Status?: string };
  } | null;
}

const useShipmentLive = (orderId: string, waybillNumber: string | null) => {
  const api = getApiClient();

  return useQuery<ShipmentLiveData>({
    queryKey: ["admin-order-shipment-live", orderId],
    queryFn: async () => {
      const res = await api.get(
        ENDPOINTS.admin.orders.fetch_shipment_live(orderId),
      );
      return res.data?.data ?? { waybill_number: null, tracking_info: null };
    },
    enabled: !!orderId && !!waybillNumber,
  });
};

export default useShipmentLive;
