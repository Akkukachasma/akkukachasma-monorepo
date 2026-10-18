/** Delhivery rejects these in free-text / reference fields. */
const DELHIVERY_FORBIDDEN_CHARS = /[&#%;\\]/g;

/** Separates Mongo order id from invoice slug in Delhivery `order` / ReferenceNo. */
export const DELHIVERY_ORDER_REF_SEP = '__';

/**
 * Sanitize invoice number for Delhivery `order` / `seller_inv`
 * (e.g. AKC/26-27/29 → AKC-26-27-29).
 */
export function sanitizeInvoiceForDelhivery(invoiceNumber: string): string {
  return String(invoiceNumber || '')
    .trim()
    .replace(/\//g, '-')
    .replace(DELHIVERY_FORBIDDEN_CHARS, '')
    .replace(/\s+/g, '');
}

/**
 * Build Delhivery client reference (`order` field → ReferenceNo).
 * With invoice: `{orderId}__{invoiceSlug}`; without: plain `orderId`.
 */
export function buildDelhiveryOrderRef(
  orderId: string,
  invoiceNumber: string | null | undefined,
): string {
  const slug = invoiceNumber
    ? sanitizeInvoiceForDelhivery(invoiceNumber)
    : '';
  if (!slug) {
    return orderId;
  }
  return `${orderId}${DELHIVERY_ORDER_REF_SEP}${slug}`;
}

/**
 * Extract Mongo order id from Delhivery ReferenceNo (legacy plain id or composite).
 */
export function parseOrderIdFromDelhiveryRef(referenceNo: string): string {
  const raw = String(referenceNo || '').trim();
  if (!raw) return raw;
  const sep = DELHIVERY_ORDER_REF_SEP;
  const idx = raw.indexOf(sep);
  if (idx <= 0) return raw;
  return raw.slice(0, idx);
}

export function formatSellerInvDate(date: Date | string | null | undefined): string {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}
