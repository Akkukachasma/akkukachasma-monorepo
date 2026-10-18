"use client";
import MultiCardSlider from "@/components/ui/swiper/MultiCardSlider";
import { ISeparatedProduct } from "@/lib/types";
import { SwiperProps } from "swiper/react";
import ProductCard2 from "./cards/ProductCard2";

interface ProductsSliderProps {
  data?: ISeparatedProduct[];
  breakpoints?: SwiperProps["breakpoints"];
  slideClass?: string;
  className?: string;
}
const ProductSlider: React.FC<ProductsSliderProps> = ({
  data = [],
  breakpoints,
  slideClass = "",
  className = "",
}) => {
  return (
    <MultiCardSlider
      template={ProductCard2}
      data={data}
      slideClass={slideClass}
      className={className}
      breakpoints={breakpoints}
      navigation
    />
  );
};
export default ProductSlider;
