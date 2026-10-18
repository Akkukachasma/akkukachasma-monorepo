"use client";
/** Swiper `loop` duplicates slides in the DOM and conflicts with React; use `rewind` instead. */

import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperProps } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination } from "swiper/modules";
import React, { useRef } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ISeparatedProduct } from "@/lib/types";

export interface SliderTemplateProps<T = ISeparatedProduct> {
  index: number;
  data: T;
}

/** Slide component: plain FC or forwardRef (optional ref forwarded to the template). */
export type MultiCardSliderTemplate<T = ISeparatedProduct> =
  | React.ForwardRefExoticComponent<
      SliderTemplateProps<T> & React.RefAttributes<HTMLElement>
    >
  | React.FC<SliderTemplateProps<T>>;

export interface MultiCardSliderProps<T = ISeparatedProduct> {
  className?: string;
  height?: number;
  template: MultiCardSliderTemplate<T>;
  data?: T[];
  breakpoints?: SwiperProps["breakpoints"];
  /** Show prev/next navigation buttons (default: true when multiple slides) */
  navigation?: boolean;
  templateRef?: React.Ref<HTMLElement>;
  swiperClass?: string;
  slideClass?: string;
  pagination?: boolean;
}

const defaultBreakPoints: SwiperProps["breakpoints"] = {
  "@0.00": {
    slidesPerView: 1,
    // spaceBetween: 10,
  },
  "@0.75": {
    slidesPerView: 2,
    // spaceBetween: 10,
  },
  "@1.00": {
    slidesPerView: 3,
    // spaceBetween: 20,
  },
  "@1.50": {
    slidesPerView: 4,
    // spaceBetween: 30,
  },
};

function MultiCardSlider<T = ISeparatedProduct>({
  className = "",
  swiperClass = "",
  slideClass = "",
  template,
  data = [],
  breakpoints = defaultBreakPoints,
  navigation = false,
  pagination = true,
  templateRef,
}: MultiCardSliderProps<T>) {
  const Template = template;

  const swiperRef = useRef<SwiperType | null>(null);

  const navButtonClass = cn(
    "absolute top-1/2 z-10 -translate-y-1/2",
    "flex size-9 items-center justify-center rounded-full",
    "bg-background/90 text-foreground shadow-md backdrop-blur-sm",
    "opacity-0 transition-opacity duration-200",
    "hover:bg-background hover:shadow-lg",
    "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "group-hover:opacity-100",
  );

  const showNav = navigation !== false && data.length > 1;

  return (
    <div className={cn("group relative px-2", className)}>
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onBeforeDestroy={() => {
          swiperRef.current = null;
        }}
        modules={[Pagination]}
        style={
          {
            "--swiper-pagination-color": "hsl(var(--primary))",
          } as React.CSSProperties
        }
        breakpoints={breakpoints}
        spaceBetween={10}
        pagination={
          pagination
            ? {
                clickable: true,
              }
            : false
        }
        rewind
        className={cn("mySwiper", swiperClass)}
      >
        {data.map((d, index) => (
          <SwiperSlide
            key={String((d as { id?: string }).id ?? index)}
            className={cn("", slideClass)}
          >
            <Template ref={templateRef} data={d} index={index} />
          </SwiperSlide>
        ))}
      </Swiper>

      {showNav && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className={cn(navButtonClass, "left-2")}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className={cn(navButtonClass, "right-2")}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default MultiCardSlider;
