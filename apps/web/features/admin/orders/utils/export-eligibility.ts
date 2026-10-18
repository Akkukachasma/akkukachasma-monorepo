import type { Order } from "../queries/useGetOrders";

/** Orders that may be selected for bulk invoice export (Excel). */
export function isOrderExportSelectable(order: Order): boolean {
  return Boolean(
    order.invoice?.id &&
      order.invoice.status !== "void",
  );
}
