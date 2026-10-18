"use client";
/** Swiper `loop` duplicates slides in the DOM and conflicts with React; use `rewind` instead. */

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperProps } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IBannerImage } from "../banners/ListItem";
import { getAspectRatioCss } from "@/lib/constants/banner-aspect-ratios";
import { cn } from "@/lib/utils";

interface SliderBannerProps {
  banner_images: IBannerImage[];
  aspect_ratio?: string;
  slides_per_view?: number;
}

const SliderBanner: React.FC<SliderBannerProps> = ({
  banner_images,
  aspect_ratio,
  slides_per_view = 3,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const aspectCss = getAspectRatioCss(aspect_ratio);

  const breakpoints: SwiperProps["breakpoints"] = {
    "@0.00": { slidesPerView: 1 },
    "@0.50": { slidesPerView: Math.min(2, slides_per_view) },
    "@1.00": { slidesPerView: slides_per_view },
  };

  const images = banner_images.map((bi) => ({
    url: bi?.image?.url || "",
    link: bi?.url || "#",
  }));

  const validImages = images.filter((item) => item.url);
  const showNav = validImages.length > 1;

  const navButtonClass = cn(
    "absolute top-1/2 z-10 -translate-y-1/2",
    "flex size-9 items-center justify-center rounded-full md:size-10",
    "bg-background/90 text-foreground shadow-md backdrop-blur-sm",
    "hover:bg-background hover:shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return (
    <div className="relative w-full px-1">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onBeforeDestroy={() => {
          swiperRef.current = null;
        }}
        modules={[Autoplay]}
        breakpoints={breakpoints}
        spaceBetween={16}
        rewind={showNav}
        autoplay={
          showNav
            ? {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        className="mySwiper"
      >
        {validImages.map((item, index) => (
          <SwiperSlide key={index} className="!h-auto">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: aspectCss }}
            >
              <Link
                href={item.link}
                target="_blank"
                className="relative block h-full w-full cursor-pointer"
              >
                <Image
                  src={item.url}
                  alt={`Banner image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className={cn(navButtonClass, "left-0")}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className={cn(navButtonClass, "right-0")}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default SliderBanner;
