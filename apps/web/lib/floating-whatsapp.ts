/**
 * First path segments that are real app routes — not product slugs.
 * Product PDP URLs are `/{product_slug}/{model_number}` (two segments).
 */
const RESERVED_ROOT_SEGMENTS = new Set([
  "manage",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  "cart",
  "checkout",
  "wishlist",
  "search",
  "categories",
  "shapes",
  "blog",
  "about-us",
  "support",
  "try-at-home",
  "franchise-enquiry",
  "track-order",
  "customers",
  "privacy",
  "terms",
  "test",
]);

/** Product details: /[product_slug]/[model_number] */
function isProductDetailsPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  return !RESERVED_ROOT_SEGMENTS.has(segments[0]!.toLowerCase());
}

export function shouldShowFloatingWhatsapp(pathname: string): boolean {
  if (pathname === "/manage" || pathname.startsWith("/manage/")) {
    return false;
  }
  if (isProductDetailsPath(pathname)) {
    return false;
  }
  return true;
}
