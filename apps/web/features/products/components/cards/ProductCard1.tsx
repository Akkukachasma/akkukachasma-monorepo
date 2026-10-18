"use client";

import { SliderTemplateProps } from "@/components/ui/swiper/MultiCardSlider";
import React from "react";
import ImageCarousel from "@/components/ui/swiper/ImageCarousel";
import { ISeparatedProduct } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { getColorName } from "@/lib/hooks/useColorName";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/features/wishlist";
import { useRouter } from "next/navigation";
import { cn, computeDiscountPercent } from "@/lib/utils";

export interface ProductCardProps extends SliderTemplateProps<ISeparatedProduct> {
  className?: string;
  /** Carousel image height; lower values suit dense grids on small screens. */
  imageHeight?: number;
  /** Dense layout for home-page mobile grid (2 columns). */
  compact?: boolean;
}

const ProductCard1 = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ data, className = "", imageHeight = 380, compact = false }, ref) => {
    const router = useRouter();
    const colorName = data.colors?.length ? getColorName(data.colors) : "";
    const p = data.product;
    const discountPercent = computeDiscountPercent(p?.price, p?.listing_price);
    const qs = colorName
      ? `?color_name=${encodeURIComponent(colorName)}`
      : "";
    const href = `/${p?.slug}/${data.model_number}${qs}`;

    const handleProductClick = () => {
      router.push(href);
    };

    return (
      <div
        onClick={() => handleProductClick()}
        onMouseEnter={() => router.prefetch(href)}
        ref={ref}
        className={cn(
          "relative block h-full w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl border border-transparent bg-card text-card-foreground shadow-sm animate-smooth hover:shadow-lg dark:border-border/60",
          compact && "rounded-lg shadow-none",
          className,
        )}
      >
        <div className="h-fit">
          <ImageCarousel
            images={data.images?.map((image) => image.url)}
            height={imageHeight}
            autoplay
            showDotNavigation={!compact}
          />
        </div>
        <div
          className={cn(
            "space-y-3 px-4 pb-4 pt-2",
            compact && "space-y-1 px-2 pb-2 pt-1",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              compact && "gap-0.5",
            )}
          >
            <div
              className={cn(
                "grid min-w-0 flex-1 place-content-center text-center text-xs",
                compact && "leading-tight",
              )}
            >
              <strong className={cn(compact && "text-[10px] font-semibold")}>
                {p?.frame_width}
                {compact ? "" : " mm"}
              </strong>
              <span
                className={cn(
                  "block text-muted-foreground",
                  compact ? "text-[8px] leading-none" : "text-xs",
                )}
              >
                {compact ? "Frame W" : "Frame Width"}
              </span>
            </div>
            <div
              className={cn(
                "grid min-w-0 flex-1 place-content-center text-center text-xs",
                compact && "leading-tight",
              )}
            >
              <strong className={cn(compact && "text-[10px] font-semibold")}>
                {p?.lens_width}
                {compact ? "" : " mm"}
              </strong>
              <span
                className={cn(
                  "block text-muted-foreground",
                  compact ? "text-[8px] leading-none" : "text-xs",
                )}
              >
                {compact ? "Lens W" : "Lens Width"}
              </span>
            </div>
            <div
              className={cn(
                "grid min-w-0 flex-1 place-content-center text-center text-xs",
                compact && "leading-tight",
              )}
            >
              <strong
                className={cn(
                  "uppercase",
                  compact && "text-[10px] font-semibold",
                )}
              >
                {p?.frame_size}
              </strong>
              <span
                className={cn(
                  "block text-muted-foreground",
                  compact ? "text-[8px] leading-none" : "text-xs",
                )}
              >
                {compact ? "Size" : "Frame Size"}
              </span>
            </div>
          </div>
          <Separator className={cn("my-1", compact && "my-0.5")} />
          <div className="flex items-center justify-between gap-1">
            <div
              className={cn(
                "flex min-w-0 flex-grow flex-wrap items-baseline",
                compact ? "gap-x-1 gap-y-0" : "gap-2 text-base",
              )}
            >
              <span
                className={cn(
                  "font-semibold text-primary",
                  compact ? "text-[11px] leading-none" : undefined,
                )}
              >
                ₹{p?.price}
              </span>
              <span
                className={cn(
                  "line-through text-destructive",
                  compact ? "text-[9px] leading-none" : undefined,
                )}
              >
                ₹{p?.listing_price}
              </span>
            </div>
            {data.colors?.length ? (
              <div
                className={cn(
                  "flex shrink-0 animate-smooth flex-col overflow-hidden rounded-full",
                  compact ? "size-4" : "size-6",
                )}
              >
                {data.colors.map((color) => (
                  <span
                    className="inline-block h-full w-full"
                    style={{ background: color.color }}
                    key={color.id}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {p != null && discountPercent > 0 ? (
          <Badge
            variant="destructive"
            className={cn(
              "absolute z-[10]",
              compact
                ? "left-1.5 top-1.5 px-1 py-0 text-[9px] font-medium leading-tight"
                : "left-4 top-4",
            )}
          >
            {discountPercent}% OFF
          </Badge>
        ) : null}
        <WishlistButton
          productColorId={data.id}
          initialWishlisted={data.is_wishlisted}
          isMobile={compact}
          className={cn(
            "absolute z-[10]",
            compact ? "right-1.5 top-1.5" : "right-4 top-4",
          )}
        />
      </div>
    );
  },
);
ProductCard1.displayName = "ProductCard1";
export default ProductCard1;
