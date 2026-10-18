"use client";
import React, { useMemo } from "react";
import { FreeMode, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperClass } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import Image from "next/image";
import { IProductColor } from "@/lib/types";
import { useParams } from "next/navigation";

interface GalleryCarouselProps {
  product_colors: IProductColor[];
  /** App-style PDP: full-bleed swipe + dots, no thumbnail rail. */
  variant?: "default" | "mobile";
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  product_colors,
  variant = "default",
}) => {
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperClass>();
  const [mainSwiper, setMainSwiper] = React.useState<SwiperClass | null>(null);
  const { model_number } = useParams<{ model_number: string }>();
  const product_color = useMemo(() => {
    return product_colors?.find(
      (color) => String(color.model_number) === String(model_number),
    );
  }, [product_colors, model_number]);

  const images = product_color?.images ?? [];
  const imageCount = images.length;

  if (variant === "mobile") {
    return (
      <div className="w-full bg-muted/20">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: images.length > 5 }}
          spaceBetween={0}
          slidesPerView={1}
          rewind={imageCount > 1}
          className="gallery-mobile aspect-[4/5] max-h-[min(72vh,560px)] w-full pb-10 [&_.swiper-pagination]:bottom-2 [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet-active]:w-4 [&_.swiper-pagination-bullet-active]:rounded-full [&_.swiper-pagination-bullet-active]:bg-primary"
        >
          {images.length ? (
            images.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="flex h-full w-full items-center justify-center px-2 py-3">
                  <Image
                    src={image.url}
                    alt="Product"
                    width={900}
                    height={1200}
                    priority
                    className="h-full w-full max-h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="flex min-h-[min(72vh,560px)] w-full items-center justify-center bg-muted/40 px-4">
                <p className="text-center text-sm text-muted-foreground">
                  No images available
                </p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4">
      {/* Thumbnail navigator - vertical strip on the left */}
      <div className="flex-shrink-0 w-20 md:w-24">
        <Swiper
          onSwiper={setThumbsSwiper}
          direction="vertical"
          spaceBetween={10}
          slidesPerView="auto"
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Thumbs]}
          className="!overflow-hidden"
        >
          {product_color?.images?.map((image) => (
            <SwiperSlide key={image.id} className="!h-auto">
              <div className="relative aspect-square w-full cursor-pointer rounded-md border-2 border-transparent overflow-hidden hover:border-muted-foreground/30 transition-colors">
                <Image
                  src={image.url}
                  alt="product thumbnail"
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main image gallery with custom nav */}
      <div className="relative flex-1 min-w-0">
        <Swiper
          onSwiper={setMainSwiper}
          modules={[FreeMode, Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          spaceBetween={10}
          navigation={false}
          rewind={(product_color?.images?.length ?? 0) > 1}
          className="h-[400px] md:h-[500px] lg:h-[700px]"
        >
          {product_color?.images?.length ? (
            product_color?.images.map((image) => (
              <SwiperSlide key={image.id}>
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    src={image.url}
                    alt="product image"
                    width={900}
                    height={600}
                    className="h-full w-auto max-h-full max-w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide className="w-full min-h-[400px] h-full bg-primary/10 grid place-content-center">
              <p className="text-center">No images available</p>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Custom navigation buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md hover:bg-secondary/90"
          onClick={() => mainSwiper?.slidePrev()}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-md hover:bg-secondary/90"
          onClick={() => mainSwiper?.slideNext()}
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
export default GalleryCarousel;
