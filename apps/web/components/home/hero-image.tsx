"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type HeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Full-bleed hero image — same object-fit as legacy hero video. */
export function HeroImage({
  src,
  alt,
  className,
  priority = false,
}: HeroImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className={cn(
        "object-cover object-center",
        className,
      )}
    />
  );
}
