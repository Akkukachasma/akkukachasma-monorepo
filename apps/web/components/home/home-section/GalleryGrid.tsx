import React from "react";
import Image from "next/image";

const images = [
  "/images/banner1.png",
  "/images/banner1.png",
  "/images/banner1.png",
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
