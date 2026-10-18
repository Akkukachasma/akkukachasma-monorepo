import { ROUTE_LOADER_CONFIG } from "./config";

export type LoaderPhase = "idle" | "entering" | "visible" | "exiting";

export interface NavigationSession {
  id: number;
  startedAt: number;
  phase: LoaderPhase;
}

/**
 * Builds a stable route key for pathname + search param changes.
 */
type SearchParamsLike = { toString(): string };

export function buildRouteKey(
  pathname: string,
  searchParams: SearchParamsLike,
): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Current URL as a route key (for popstate / bfcache when React has not re-rendered yet). */
export function buildRouteKeyFromWindow(): string {
  if (typeof window === "undefined") return "";
  const { pathname, search } = window.location;
  return search ? `${pathname}${search}` : pathname;
}

/**
 * Returns true when href points to the same route as the current key.
 */
export function isSameRouteHref(
  href: string,
  currentRouteKey: string,
  origin: string,
): boolean {
  if (!href || href.startsWith("#")) return true;

  try {
    const url = new URL(href, origin);
    const targetKey = url.search
      ? `${url.pathname}${url.search}`
      : url.pathname;
    return targetKey === currentRouteKey;
  } catch {
    return false;
  }
}

/**
 * Detects internal App Router navigations from anchor clicks.
 */
export function isInternalNavigationAnchor(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  return href.startsWith("/") || !href.includes("://");
}

/**
 * Computes remaining time until the loader can safely hide.
 */
export function getRemainingMinVisibleMs(
  startedAt: number,
  minVisibleMs: number = ROUTE_LOADER_CONFIG.minVisibleMs,
): number {
  const elapsed = Date.now() - startedAt;
  return Math.max(0, minVisibleMs - elapsed);
}

/**
 * Schedules a callback after the minimum visible duration, with cancel support.
 */
export function scheduleAfterMinVisible(
  startedAt: number,
  callback: () => void,
  minVisibleMs: number = ROUTE_LOADER_CONFIG.minVisibleMs,
): () => void {
  const delay = getRemainingMinVisibleMs(startedAt, minVisibleMs);
  const timerId = window.setTimeout(callback, delay);
  return () => window.clearTimeout(timerId);
}
