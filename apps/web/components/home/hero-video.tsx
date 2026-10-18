"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type HeroVideoProps = {
  src: string;
  isActive?: boolean;
  className?: string;
  preload?: "none" | "metadata" | "auto";
};

/**
 * Hero background video — only the active slide should pass isActive=true in sliders.
 */
export function HeroVideo({
  src,
  isActive = true,
  className,
  preload = "metadata",
}: HeroVideoProps) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    if (isActive) {
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => undefined);
      }
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [isActive, src]);

  if (!isActive) {
    return (
      <div
        className={cn(
          "absolute inset-0 z-[1] h-full w-full bg-black/40",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      crossOrigin="anonymous"
      className={cn(
        "absolute inset-0 z-[1] w-full h-full object-cover",
        className,
      )}
    />
  );
}
