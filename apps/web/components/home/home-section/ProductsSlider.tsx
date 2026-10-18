"use client";

import MultiCardSlider from "@/components/ui/swiper/MultiCardSlider";
import ProductCard1 from "@/features/products/components/cards/ProductCard1";
import { ISeparatedProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductsSliderProps {
  data?: ISeparatedProduct[];
  title: string;
  subtitle: string;
  className?: string;
}

const ProductsSlider: React.FC<ProductsSliderProps> = ({
  data = [],
  title,
  subtitle,
  className = "",
}) => {
  if (!data.length) return null;

  return (
    <section
      className={cn(
        "app-container mt-6 flex flex-col gap-4 md:mt-7 md:gap-6",
        className,
      )}
    >
      <h2 className="px-2 text-center text-lg tracking-wide sm:text-xl">
        <span className="mr-2 uppercase text-muted-foreground">{title}</span>
        <span className="border-b-2 border-foreground">{subtitle}</span>
      </h2>

      {/* Mobile: 2-column product grid */}
      <ul className="grid grid-cols-2 gap-2 px-2 sm:gap-4 md:hidden">
        {data.map((item, index) => (
          <li key={item.id} className="min-w-0">
            <ProductCard1
              data={item}
              index={index}
              compact
              imageHeight={200}
              className="mx-auto w-full max-w-none"
            />
          </li>
        ))}
      </ul>

      {/* Tablet/desktop: carousel */}
      <div className="hidden md:block">
        <MultiCardSlider
          slideClass="py-8"
          template={ProductCard1}
          data={data}
          navigation
        />
      </div>
    </section>
  );
};

export default ProductsSlider;
