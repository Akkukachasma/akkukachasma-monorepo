import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SliderTemplateProps } from "@/components/ui/swiper/MultiCardSlider";
import { IProductStarter } from "@/lib/types";
import Link from "next/link";
import React from "react";

interface ProductStarterProps extends SliderTemplateProps<IProductStarter> {}
const ProductStarter: React.FC<ProductStarterProps> = ({ data, index }) => {
  return (
    <Link
      href={`/shapes/${data?.slug}`}
      className="max-w-36 grid place-content-center relative group h-full"
    >
      <div className="flex flex-col items-center">
        <Avatar className="size-24 rounded-lg">
          <AvatarImage
            src={data?.products?.[0]?.product_colors?.[0]?.images?.[0]?.url}
            alt={data?.title}
          />
          <AvatarFallback className="rounded-lg text-2xl text-gray-700 font-bold">
            {data?.title?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-700 text-lg font-medium group-hover:hidden animate-smooth">
          {data?.title}
        </span>
      </div>
      <div className="absolute top-full left-0 right-0 group-hover:top-0 group-hover:bottom-0 animate-smooth bg-primary/60 grid place-content-center rounded-t-2xl">
        <div className="text-center text-white font-bold text-xs">
          <span>Starting from</span>
          <br />
          <span className="text-3xl">₹ {data?.products?.[0]?.price}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center bg-primary text-white py-2">
          {data?.title}
        </div>
      </div>
    </Link>
  );
};
export default ProductStarter;
