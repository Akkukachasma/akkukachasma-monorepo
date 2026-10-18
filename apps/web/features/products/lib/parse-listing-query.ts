export const DEFAULT_PRODUCT_PAGE_SIZE = 50;

const ALLOWED_PAGE_SIZES = new Set([20, 40, 50, 100]);

export function parseListingPage(
  value: string | number | undefined | null,
): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseListingLimit(
  value: string | number | undefined | null,
  fallback: number = DEFAULT_PRODUCT_PAGE_SIZE,
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(n) && ALLOWED_PAGE_SIZES.has(n)) return n;
  return fallback;
}
