"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import type { HeroMediaFile } from "@/features/hero-home-media/types";
import { HeroMediaItem } from "./hero-media-item";
type HeroSliderProps = {
  files: HeroMediaFile[];
  cacheVersion: string | null;
  title?: string | null;
};

export function HeroSlider({ files, cacheVersion, title }: HeroSliderProps) {
  const [activeFileId, setActiveFileId] = React.useState<string | null>(
    () => files[0]?.id ?? null,
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const sorted = React.useMemo(
    () => [...files].sort((a, b) => a.sort_order - b.sort_order),
    [files],
  );

  if (sorted.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-[1] h-full w-full"
      aria-roledescription="carousel"
      aria-label={title?.trim() || "Homepage hero slideshow"}
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, A11y, Keyboard]}
        onSlideChange={(s) => {
          setActiveIndex(s.realIndex);
          const file = sorted[s.realIndex];
          if (file) setActiveFileId(file.id);
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={sorted.length > 1}
        speed={reducedMotion ? 0 : 700}
        autoplay={
          sorted.length > 1 && !reducedMotion
            ? {
                delay: 5500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50",
          bulletActiveClass: "!bg-white",
        }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        className="h-full w-full [&_.swiper-pagination]:!bottom-3"
      >
        {sorted.map((file, index) => (
          <SwiperSlide key={file.id} className="!h-full">
            <div className="relative h-full w-full">
              <HeroMediaItem
                file={file}
                cacheVersion={cacheVersion}
                title={title}
                isActive={file.id === activeFileId}
                priorityImage={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {sorted.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-[2] rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {activeIndex + 1} / {sorted.length}
        </div>
      )}
    </div>
  );
}
