"use client";

import { useHeroActiveMedia } from "@/features/hero-home-media/queries/useHeroActiveMedia";
import { HeroMedia } from "./hero-media";

/** Fetches active hero metadata and renders banner or slider. */
export function HeroMediaRenderer() {
  const { data } = useHeroActiveMedia();
  return <HeroMedia data={data} />;
}
