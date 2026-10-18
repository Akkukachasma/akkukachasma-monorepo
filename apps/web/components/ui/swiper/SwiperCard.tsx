import Image from "next/image";
import React from "react";
import { Card } from "../card";

interface ISlide {
  src: string;
  title: string;
}

interface ISwiperCardProps {
  slide: ISlide;
}

const SwiperCard: React.FC<ISwiperCardProps> = ({ slide }) => {
  return (
    <Card className="h-[100%] w-full flex flex-col justify-between border-none shadow-none">
      <div className="max-h-[80%] h-[80%] w-full flex items-center justify-center">
        <Image
          src={`/${slide.src}`}
          alt="glass"
          className="block h-full w-full object-contain rounded-lg"
          width={600}
          height={400}
        />
      </div>
      <span className="max-h-[20%] h-[20%] flex flex-col items-center justify-center text-sm">
        {slide.title}
      </span>
    </Card>
  );
};

export default SwiperCard;
