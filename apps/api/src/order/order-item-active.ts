/** Order line still counts for pricing, stock-on-cancel, and shipment lists. */
export function isActiveOrderLine(item: {
  admin_cancelled_at?: Date | string | null;
}): boolean {
  return item.admin_cancelled_at == null;
}
