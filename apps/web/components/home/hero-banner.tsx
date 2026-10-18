"use client";

import type { HeroMediaFile } from "@/features/hero-home-media/types";
import { HeroMediaItem } from "./hero-media-item";

type HeroBannerProps = {
  file: HeroMediaFile;
  cacheVersion: string | null;
  title?: string | null;
};

/** Single-file banner — uses first file only (matches BANNER business rule). */
export function HeroBanner({ file, cacheVersion, title }: HeroBannerProps) {
  return (
    <div className="absolute inset-0 z-[1] h-full w-full">
      <HeroMediaItem
        file={file}
        cacheVersion={cacheVersion}
        title={title}
        isActive
        priorityImage
      />
    </div>
  );
}
