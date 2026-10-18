import React from "react";
import Image from "next/image";
import GalleryGrid from "./GalleryGrid";

const HomeGallery: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* <Image
        src="/images/banner1.png"
        alt="GalleryImages"
        width={200}
        height={100}
        className="w-full object-cover max-h-96"
      /> */}

      {/* <GalleryGrid /> */}
      <div className="py-20 text-center">
        <p className="text-lg md:text-xl text-black font-normal tracking-wider py-2">
          Discount On Every Single Item On Our Site.
        </p>
        <h1 className="text-xl md:text-3xl font-bold text-black tracking-wider py-2">
          OMG! JUST LOOK AT THE GREAT DEALS!
        </h1>
        <p className="text-xs md:text-base font-medium text-black tracking-widest py-2">
          HOW DOES IT FEEL, WHEN YOU SEE GREAT DISCOUNT DEALS FOR EACH PRODUCT?
        </p>
      </div>
    </div>
  );
};

export default HomeGallery;
