"use client";

import React from "react";
import { IBanner } from "../banners/ListItem";
import CarouselBanner from "./CarouselBanner";
import GridBanner from "./GridBanner";
import MasonryBanner from "./MasonryBanner";
import SliderBanner from "./SliderBanner";
import {
  BANNER_LAYOUTS,
  type BannerLayoutConfig,
} from "@/lib/constants/banner-layouts";
import { cn } from "@/lib/utils";

interface BannerRendererProps {
  banner: IBanner;
  layout: BannerLayoutConfig | keyof typeof BANNER_LAYOUTS;
  className?: string;
}

function resolveLayout(
  layout: BannerLayoutConfig | keyof typeof BANNER_LAYOUTS
): BannerLayoutConfig {
  if (typeof layout === "string" && layout in BANNER_LAYOUTS) {
    return BANNER_LAYOUTS[layout as keyof typeof BANNER_LAYOUTS];
  }
  return layout as BannerLayoutConfig;
}

const BannerRenderer: React.FC<BannerRendererProps> = ({
  banner,
  layout,
  className,
}) => {
  const config = resolveLayout(layout);

  const content = (
    <div className={cn("flex flex-col gap-8 w-full", config.spacing)}>
      {banner.title && (
        <h2
          className={cn(
            "tracking-wide text-center",
            config.titleSize ?? "text-3xl"
          )}
        >
          <span className="uppercase text-primary/80 font-semibold mr-2">
            {banner.title}
          </span>
        </h2>
      )}

      {banner.type === "carousel" && (
        <>
          {config.carouselEnabled ? (
            <CarouselBanner banner_images={banner?.banner_images} />
          ) : (
            <GridBanner
              banner_images={banner?.banner_images}
              aspect_ratio={banner?.aspect_ratio}
              gridColumns={config.gridColumns}
            />
          )}
        </>
      )}

      {banner.type === "grid" && (
        <GridBanner
          banner_images={banner?.banner_images}
          aspect_ratio={banner?.aspect_ratio}
          gridColumns={config.gridColumns}
        />
      )}

      {banner.type === "masonry" && (
        <MasonryBanner
          banner_images={banner?.banner_images}
          masonryColumns={config.masonryColumns}
        />
      )}

      {banner.type === "slider" && (
        <>
          {config.sliderEnabled !== false ? (
            config.container === "fullWidth" ? (
              <div className="app-container">
                <SliderBanner
                  banner_images={banner?.banner_images}
                  aspect_ratio={banner?.aspect_ratio}
                  slides_per_view={banner?.slides_per_view ?? 3}
                />
              </div>
            ) : (
              <SliderBanner
                banner_images={banner?.banner_images}
                aspect_ratio={banner?.aspect_ratio}
                slides_per_view={banner?.slides_per_view ?? 3}
              />
            )
          ) : (
            <GridBanner
              banner_images={banner?.banner_images}
              aspect_ratio={banner?.aspect_ratio}
              gridColumns={config.gridColumns}
            />
          )}
        </>
      )}
    </div>
  );

  if (config.container === "fullWidth") {
    return (
      <div
        className={cn(
          "w-screen relative left-1/2 -translate-x-1/2 overflow-hidden",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return <div className={cn("w-full", className)}>{content}</div>;
};

export default BannerRenderer;
