"use client";

/**
 * @deprecated Import from useHeroActiveMedia — kept for existing imports.
 */
export {
  useHeroActiveMedia as useHeroStreamMetadata,
  heroMediaQueryKey,
} from "./useHeroActiveMedia";

export { buildHeroVideoSrc, buildHeroStreamSrc } from "../lib/build-hero-stream-src";

export type { HeroActiveMedia as HeroStreamMetadata } from "../types";
