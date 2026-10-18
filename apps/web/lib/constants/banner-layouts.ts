export type BannerLayoutConfig = {
  container: "fullWidth" | "constrained";
  gridColumns: string;
  masonryColumns: string;
  spacing: string;
  titleSize?: string;
  carouselEnabled?: boolean;
  sliderEnabled?: boolean;
};

export const BANNER_LAYOUTS = {
  home: {
    container: "fullWidth",
    gridColumns: "grid-cols-1",
    masonryColumns: "columns-1 sm:columns-2 lg:columns-3",
    spacing: "py-8",
    titleSize: "text-2xl",
    carouselEnabled: true,
    sliderEnabled: true,
  } satisfies BannerLayoutConfig,
  product: {
    container: "constrained",
    gridColumns: "grid-cols-1 md:grid-cols-2",
    masonryColumns: "columns-1 md:columns-2",
    spacing: "py-4 md:py-6",
    titleSize: "text-xl",
    carouselEnabled: false,
    sliderEnabled: true,
  } satisfies BannerLayoutConfig,
} as const;
