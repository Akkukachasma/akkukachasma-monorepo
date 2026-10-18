/**
 * Natural intent labels for banner aspect ratios.
 * Maps user-friendly names to CSS aspect-ratio values.
 */
export const BANNER_ASPECT_RATIO_OPTIONS = [
  { value: "landscape", label: "Landscape (16:9)", ratio: "16/9" },
  { value: "portrait", label: "Portrait (9:16)", ratio: "9/16" },
  { value: "cinematic", label: "Cinematic (21:9)", ratio: "21/9" },
  { value: "square", label: "Square (1:1)", ratio: "1/1" },
  { value: "standard", label: "Standard (4:3)", ratio: "4/3" },
  { value: "vertical", label: "Vertical (3:4)", ratio: "3/4" },
  { value: "ultrawide", label: "Ultrawide (4:1)", ratio: "4/1" },
  { value: "ribbon", label: "Ribbon (8:1)", ratio: "8/1" },
] as const;

export type BannerAspectRatioKey =
  (typeof BANNER_ASPECT_RATIO_OPTIONS)[number]["value"];

/** Map aspect ratio intent to CSS aspect-ratio value */
export function getAspectRatioCss(
  intent: BannerAspectRatioKey | string | undefined
): string {
  const option = BANNER_ASPECT_RATIO_OPTIONS.find((o) => o.value === intent);
  return option?.ratio ?? "16/9";
}
