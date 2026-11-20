import { S3_ASSETS } from "@/lib/s3-assets";
import React from "react";
import Image from "next/image";

const images = [
  S3_ASSETS.img("banner1.png"),
  S3_ASSETS.img("banner1.png"),
  S3_ASSETS.img("banner1.png"),
];

const GalleryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Gallery Image ${index + 1}`}
          width={200}
          height={100}
          className="w-full object-cover"
        />
      ))}
    </div>
  );
};

export default GalleryGrid;
