"use client";

import React from "react";
import Image from "next/image";
import { IBannerImage } from "../banners/ListItem";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MasonryBannerProps {
  banner_images: IBannerImage[];
  masonryColumns: string;
}

const MasonryBanner: React.FC<MasonryBannerProps> = ({
  banner_images,
  masonryColumns,
}) => {
  return (
    <div className={cn("w-full gap-4", masonryColumns)}>
      {banner_images.map((img, index) => {
        const imageUrl = img.image?.url;

        if (!imageUrl) return null;

        return (
          <div key={index} className="break-inside-avoid mb-4 w-full">
            <Link
              href={img?.url || "#"}
              target="_blank"
              className="relative block w-full cursor-pointer"
            >
              <Image
                src={imageUrl}
                alt={`Banner Image ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default MasonryBanner;
