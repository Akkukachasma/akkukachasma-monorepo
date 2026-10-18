import { getBaseUrl } from "@/lib/api";

/** Absolute URL for embedding <video src> with cache bust on update. */
export function buildEmbeddingStreamSrc(
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
