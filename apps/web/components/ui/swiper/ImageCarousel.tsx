"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  className?: string;
  imageClass?: string;
  height?: number;
  images?: string[];
  autoplay?: boolean;
  showDotNavigation?: boolean;
}
const ImageCarousel = ({
  className = "",
  imageClass = "",
  height = 250,
  images = [],
  autoplay = false,
  showDotNavigation = true,
}: ImageCarouselProps) => {
  return (
    <div className={cn(className)} style={{ height }}>
      <Swiper
        modules={[Autoplay, ...(showDotNavigation ? [Pagination] : [])]}
        slidesPerView={1}
        pagination={
          showDotNavigation
            ? {
                clickable: true,
              }
            : false
        }
        className="mySwiper"
        rewind={images.length > 1}
        autoplay={autoplay}
      >
        {images.map((image, index) => (
          <SwiperSlide style={{ height }} key={index} className="w-full h-full">
            <Image
              src={image}
              alt={`Carousel image ${index}`}
              width={1000}
              height={height}
              className={cn(
                "w-auto h-full mx-auto max-w-full max-h-full",
                imageClass,
              )}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageCarousel;
