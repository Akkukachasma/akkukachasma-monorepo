"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { HeroActiveMedia } from "../types";

export const heroMediaQueryKey = ["hero-media", "active"] as const;

function normalizeActivePayload(raw: Record<string, unknown>): HeroActiveMedia {
  const files = Array.isArray(raw.files) ? raw.files : [];
  const hasMedia = Boolean(raw.has_media ?? raw.hasVideo ?? files.length);

  return {
    has_media: hasMedia,
    hasVideo: Boolean(raw.hasVideo),
    type: (raw.type as HeroActiveMedia["type"]) ?? null,
    cache_version:
      (raw.cache_version as string | null) ??
      (raw.cacheVersion as string | null) ??
      null,
    title: (raw.title as string | null) ?? null,
    files: files as HeroActiveMedia["files"],
    streamPath: raw.streamPath as string | undefined,
    contentType: (raw.contentType as string | null) ?? null,
  };
}

export function useHeroActiveMedia() {
  return useQuery({
    queryKey: heroMediaQueryKey,
    queryFn: async (): Promise<HeroActiveMedia> => {
      const { data } = await getApiClient().get<{ data: Record<string, unknown> }>(
        ENDPOINTS.hero_media.active,
      );
      return normalizeActivePayload(data.data ?? {});
    },
    staleTime: 30_000,
  });
}
