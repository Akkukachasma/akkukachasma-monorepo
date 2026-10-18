"use client";

import { useMemo } from "react";
import type { IProduct } from "@/components/products/ListItem";
import { ProductViewTracker } from "@/features/popularity";
import GalleryCarousel from "@/components/ui/swiper/GalleryCarousel";
import PersistedColorSwitcher from "@/components/products/PersistedColorSwitcher";
import { WishlistButton } from "@/features/wishlist";
import { ShareProductButton } from "@/features/popularity";
import { Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import CollapsibleDetail from "@/features/products/components/CollapsibleDetail";
import CollapsibleProductInfo from "@/features/products/components/CollapsibleProductInfo";
import RelatedBanners from "@/features/products/components/RelatedBanners";
import RelatedShapeProducts from "@/features/products/components/RelatedShapeProducts";
import ProductEmbeddingsSection from "@/components/product/product-embeddings-section";
import ProductPurchaseAction from "@/features/products/components/ProductPurchaseAction";
import MobileNavbar from "@/components/navigation/mobile-navbar";
import { Badge } from "@/components/ui/badge";

export type ProductDetailsMobileViewProps = {
  product: IProduct;
  productSlug: string;
  modelNumber: string;
  isMobile?: boolean;
};

export default function ProductDetailsMobileView({
  product,
  productSlug,
  modelNumber,
  isMobile = true,
}: ProductDetailsMobileViewProps) {
  const selectedPc = useMemo(
    () =>
      product.product_colors?.find(
        (pc) => String(pc.model_number) === String(modelNumber),
      ) ?? product.product_colors?.[0],
    [product.product_colors, modelNumber],
  );

  const pathname = `/${productSlug}/${modelNumber}`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <ProductViewTracker
        slug={productSlug}
        model_number={modelNumber}
        product_color_id={selectedPc?.id}
      />
      <MobileNavbar
        actions={
          selectedPc?.id ? (
            <>
              <ShareProductButton
                isMobile={isMobile}
                productColorId={selectedPc.id}
                pathname={pathname}
                productTitle={product.model_name}
              />
              <WishlistButton
                isMobile={isMobile}
                productColorId={selectedPc.id}
                initialWishlisted={product.is_wishlisted}
              />
            </>
          ) : null
        }
      />

      <main className="flex-1 overflow-y-auto pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
        <GalleryCarousel
          variant="mobile"
          product_colors={product.product_colors}
        />

        <div className="px-4 pt-4">
          <PersistedColorSwitcher
            product_colors={product.product_colors}
            product_slug={productSlug}
            model_number={modelNumber}
            className="justify-center"
          />
        </div>

        <div className="space-y-4 px-4 pb-6 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category?.title}
            </p>
            <h1 className="mt-1 text-base font-semibold leading-snug text-foreground">
              {product.model_name}
            </h1>
            {selectedPc?.model_number != null ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Model {String(selectedPc.model_number)}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-grow">
              <span className="text-primary font-semibold text-3xl sm:text-4xl md:text-5xl">
                ₹{product?.price}
              </span>
              <span className="line-through text-destructive">
                ₹{product?.listing_price}
              </span>
              <span className="text-xs text-primary">
                {product?.discount_percent != null && product.discount_percent > 0
                  ? `${Math.round(product.discount_percent)}% off`
                  : null}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="border border-border">
                {product?.frame_size?.join(",")}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Frame Width */}
            <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
              <div className="text-xs text-muted-foreground">{product?.frame_width} mm</div>
              <div className="relative grid place-content-center">
                <span className="relative flex items-center w-full mb-1">
                  <span className="block w-[80%] mx-auto h-[2px] bg-destructive" />
                </span>
                <Image src="/lens-only.png" alt="lens-only" width={80} height={80} />
              </div>
              <div className="text-xs font-semibold text-foreground">Frame Width</div>
            </div>
            {/* Lens Width */}
            <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
              <div className="text-xs text-muted-foreground">{product?.lens_width} mm</div>
              <div className="relative grid place-content-center">
                <span className="absolute top-1/2 -translate-y-1/2 left-1.5 w-[28px] block h-[2px] bg-destructive" />
                <Image src="/lens-only.png" alt="lens-only" width={80} height={80} />
              </div>
              <div className="text-xs font-semibold text-foreground">Lens Width</div>
            </div>

            {/* Lens Height */}
            <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
              <div className="text-xs text-muted-foreground">{product?.lens_height} mm</div>
              <div className="relative grid place-content-center">
                <span className="absolute top-1/2 -translate-y-1/2 left-[18px] h-[28px] block w-[2px] bg-destructive" />
                <Image src="/lens-only.png" alt="lens-only" width={80} height={80} />
              </div>
              <div className="text-xs font-semibold text-foreground">Lens Height</div>
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              href="/blog/size-guide"
              className="rounded-xl border border-primary/20 bg-muted/80 p-3 active:bg-muted/40"
            >
              <h3 className="text-sm font-semibold">Know your size?</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Find the right frame size for your face.
              </p>
            </Link>
            <Link
              href="/blog/how-to-buy"
              className="rounded-xl border border-primary/20 bg-muted/80 p-3 active:bg-muted/40"
            >
              <h3 className="text-sm font-semibold">How to buy?</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Step-by-step guide to ordering lenses and frames.
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-gradient-to-br from-green-500/10 to-orange-500/10 p-3 dark:from-green-500/15 dark:to-orange-500/10">
            <div className="flex items-center gap-2">
              <Truck className="size-7 shrink-0 text-green-600" />
              <div>
                <p className="text-xs font-semibold">Free shipping</p>
                <p className="text-[10px] text-muted-foreground">Across India</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="size-7 shrink-0 text-green-600" />
              <div>
                <p className="text-xs font-semibold">Premium quality</p>
                <p className="text-[10px] text-muted-foreground">
                  Imported international
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/80" />

          <CollapsibleProductInfo product={product} />
          <CollapsibleDetail
            description={product.description}
            title={product.seo_title}
          />
          <CollapsibleDetail
            description={product.tags?.join(", ")}
            title="Tags"
          />

          <ProductEmbeddingsSection embeddings={selectedPc?.embeddings} />

          <RelatedBanners
            categoryId={product.category?.id}
            shapeId={product.shape?.id}
          />
        </div>

        <RelatedShapeProducts
          shapeSlug={product.shape?.slug}
          shapeTitle={product.shape?.title}
          excludeProductColorId={selectedPc?.id}
        />
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingTop: "0.625rem",
        }}
      >
        <div className="app-container px-3">
          <ProductPurchaseAction isMobile={isMobile} product={product} />
        </div>
      </div>
    </div>
  );
}
