"use client";

import type { HeroActiveMedia } from "@/features/hero-home-media/types";
import { HeroBanner } from "./hero-banner";
import { HeroSlider } from "./hero-slider";

type HeroMediaProps = {
  data: HeroActiveMedia | undefined;
};

function HeroFallback() {
  return (
    <div
      className="absolute inset-0 z-[1] h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      aria-hidden
    />
  );
}

/**
 * Renders active hero media as banner (first file) or slider (all files).
 */
export function HeroMedia({ data }: HeroMediaProps) {
  if (!data?.has_media || !data.files?.length) {
    return <HeroFallback />;
  }

  const sorted = [...data.files].sort((a, b) => a.sort_order - b.sort_order);
  const cacheVersion = data.cache_version;

  if (data.type === "SLIDER" && sorted.length > 0) {
    return (
      <HeroSlider
        files={sorted}
        cacheVersion={cacheVersion}
        title={data.title}
      />
    );
  }

  const first = sorted[0];
  if (!first) return <HeroFallback />;

  return (
    <HeroBanner
      file={first}
      cacheVersion={cacheVersion}
      title={data.title}
    />
  );
}
