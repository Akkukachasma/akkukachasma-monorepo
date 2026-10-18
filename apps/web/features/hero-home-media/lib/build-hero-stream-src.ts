import { getBaseUrl } from "@/lib/api";

/** Absolute URL for hero <video src> with cache busting. */
export function buildHeroStreamSrc(
  streamPath: string | null | undefined,
  cacheVersion: string | null | undefined,
): string | null {
  if (!streamPath) return null;

  const q =
    cacheVersion != null && cacheVersion !== ""
      ? `?v=${encodeURIComponent(cacheVersion)}`
      : "";

  if (streamPath.startsWith("http")) {
    return `${streamPath}${q}`;
  }

  const base = getBaseUrl();
  if (streamPath.startsWith("/v1/")) {
    return `${base}${streamPath}${q}`;
  }

  const path = streamPath.startsWith("/") ? streamPath.slice(1) : streamPath;
  return `${base}/v1/${path}${q}`;
}

/** Legacy helper — first active hero video stream. */
export function buildHeroVideoSrc(cacheVersion: string | null | undefined) {
  return `${getBaseUrl()}/v1/hero-media/stream?v=${encodeURIComponent(cacheVersion ?? "")}`;
}
