"use client";
import React from "react";
import Image from "next/image";
import { IBannerImage } from "../banners/ListItem";
import Link from "next/link";
import { getAspectRatioCss } from "@/lib/constants/banner-aspect-ratios";
import { cn } from "@/lib/utils";

interface GridBannerProps {
  banner_images: IBannerImage[];
  aspect_ratio?: string;
  gridColumns: string;
}

const GridBanner: React.FC<GridBannerProps> = ({
  banner_images,
  aspect_ratio,
  gridColumns,
}) => {
  const aspectCss = getAspectRatioCss(aspect_ratio);

  return (
    <div className={cn("grid gap-4 w-full", gridColumns)}>
      {banner_images.map((img, index) => {
        const imageUrl = img.image?.url;

        if (!imageUrl) return null;

        return (
          <div
            key={index}
            className="relative overflow-hidden w-full"
            style={{ aspectRatio: aspectCss }}
          >
            <Link
              href={img?.url || "#"}
              target="_blank"
              className="relative block w-full h-full cursor-pointer"
            >
              <Image
                src={imageUrl}
                alt={`Banner Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default GridBanner;
