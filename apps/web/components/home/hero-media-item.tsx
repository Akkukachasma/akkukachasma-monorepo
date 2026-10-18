"use client";

import type { HeroMediaFile } from "@/features/hero-home-media/types";
import { buildHeroStreamSrc } from "@/features/hero-home-media/lib/build-hero-stream-src";
import { HeroImage } from "./hero-image";
import { HeroVideo } from "./hero-video";

type HeroMediaItemProps = {
  file: HeroMediaFile;
  cacheVersion: string | null;
  title?: string | null;
  isActive?: boolean;
  priorityImage?: boolean;
};

export function HeroMediaItem({
  file,
  cacheVersion,
  title,
  isActive = true,
  priorityImage = false,
}: HeroMediaItemProps) {
  const alt = title?.trim() || "Akku Ka Chasma";

  if (file.media_kind === "image" && file.url) {
    return (
      <HeroImage
        src={file.url}
        alt={alt}
        priority={priorityImage && isActive}
      />
    );
  }

  if (file.media_kind === "video") {
    const streamSrc = buildHeroStreamSrc(file.stream_path, cacheVersion);
    if (!streamSrc) return null;

    return (
      <HeroVideo
        src={streamSrc}
        isActive={isActive}
        preload={isActive ? "metadata" : "none"}
      />
    );
  }

  return null;
}
