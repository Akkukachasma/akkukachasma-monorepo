"use client";
/** Swiper `loop` duplicates slides in the DOM and conflicts with React; use `rewind` instead. */

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import ProductCard1 from "@/features/products/components/cards/ProductCard1";
import ViewMoreShapeCard from "@/features/products/components/ViewMoreShapeCard";
import type { RelatedShapeSlide } from "@/features/products/services/related-shape-products.service";
import { cn } from "@/lib/utils";

export interface RelatedShapeProductsSliderProps {
  slides: RelatedShapeSlide[];
  className?: string;
}

export default function RelatedShapeProductsSlider({
  slides,
  className,
}: RelatedShapeProductsSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const showNav = slides.length > 1;

  const navButtonClass = cn(
    "absolute top-1/2 z-10 -translate-y-1/2",
    "flex size-9 items-center justify-center rounded-full md:size-10",
    "bg-background/90 text-foreground shadow-md backdrop-blur-sm",
    "hover:bg-background hover:shadow-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return (
    <div className={cn("relative w-full min-w-0 px-1", className)}>
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onBeforeDestroy={() => {
          swiperRef.current = null;
        }}
        spaceBetween={12}
        rewind={showNav}
        breakpoints={{
          "@0.00": { slidesPerView: 1.35 },
          "@0.50": { slidesPerView: 2.2 },
          "@0.75": { slidesPerView: 2.75 },
          "@1.00": { slidesPerView: 3.5 },
          "@1.50": { slidesPerView: 4.5 },
        }}
        className="mySwiper w-full min-w-0"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="!h-auto py-2">
            {slide.kind === "product" ? (
              <ProductCard1
                data={slide.product}
                index={index}
                compact
                imageHeight={220}
                className="mx-auto w-full max-w-none"
              />
            ) : (
              <ViewMoreShapeCard
                shapeSlug={slide.shapeSlug}
                shapeTitle={slide.shapeTitle}
                className="mx-auto w-full max-w-none"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous related product"
            className={cn(navButtonClass, "left-0")}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next related product"
            className={cn(navButtonClass, "right-0")}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
