import type { Order } from "../queries/useGetOrders";

/** Orders eligible for Delhivery Ready To Ship (manifest). */
export function isOrderManifestSelectable(order: {
  status: Order["status"];
  address?: { address?: string } | null;
  shipment_details?: { waybill_number?: string | null } | null;
}): boolean {
  if (order.status !== "confirmed" && order.status !== "picked") return false;
  if (!order.address?.address) return false;
  if (order.shipment_details?.waybill_number) return false;
  return true;
}
