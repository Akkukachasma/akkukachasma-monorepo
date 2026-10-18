import type { IProduct } from "@/components/products/ListItem";
import PersistedColorSwitcher from "@/components/products/PersistedColorSwitcher";
import GalleryCarousel from "@/components/ui/swiper/GalleryCarousel";
import { WishlistButton } from "@/features/wishlist";
import { ProductViewTracker, ShareProductButton } from "@/features/popularity";
import { fetchProductDetails } from "@/services/product.service";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { TOKENS } from "@/lib/constants";
import { stripHtmlForMeta } from "@/lib/utils";
import { Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { Separator } from "@/components/ui/separator";
import CollapsibleDetail from "@/features/products/components/CollapsibleDetail";
import CollapsibleProductInfo from "@/features/products/components/CollapsibleProductInfo";
import RelatedBanners from "@/features/products/components/RelatedBanners";
import RelatedShapeProducts from "@/features/products/components/RelatedShapeProducts";
import ProductEmbeddingsSection from "@/components/product/product-embeddings-section";
import ProductPurchaseAction from "@/features/products/components/ProductPurchaseAction";
import { isMobileDevice } from "@/lib/server";
import Navigation from "@/components/navigation";
import Footer from "@/components/navigation/Footer";
import ProductDetailsMobileView from "./product-details-mobile-view";
import { Badge } from "@/components/ui/badge";

export interface ProductDetailsParams {
  product_slug: string;
  model_number: string;
}
interface ProductDetailsPageProps {
  params: Promise<ProductDetailsParams>;
}

const SITE_NAME = "Akku Ka Chasma";
const SITE_ORIGIN = "https://akkukachasma.com";

const getProduct = cache(
  async (product_slug: string, model_number: string) => {
    try {
      return await fetchProductDetails(product_slug, { model_number });
    } catch {
      return null;
    }
  },
);

function plainProductDescription(raw: string | undefined | null): string {
  if (!raw?.trim()) return "";
  const text = stripHtmlForMeta(
    raw
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_~`]/g, " ")
      .replace(/\n+/g, " "),
  );
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trim()}…`;
}

function getProductOgImage(
  product: IProduct,
  model_number: string,
): string | undefined {
  const variant =
    product.product_colors?.find(
      (pc) => String(pc.model_number) === String(model_number),
    ) ?? product.product_colors?.[0];
  const thumbnail = variant?.images?.find((img) => img.fieldname === "thumbnail");
  return thumbnail?.url ?? variant?.images?.[0]?.url;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { product_slug, model_number } = await params;
  const product = await getProduct(product_slug, model_number);
  const canonical = `${SITE_ORIGIN}/${encodeURIComponent(product_slug)}/${encodeURIComponent(model_number)}`;

  if (!product) {
    const label = decodeURIComponent(product_slug.replace(/-/g, " "));
    return {
      title: `${label} | ${SITE_NAME}`,
      description: `Shop ${label} eyeglasses and sunglasses online at ${SITE_NAME}.`,
      alternates: { canonical },
    };
  }

  const heading =
    product.seo_title?.trim() ||
    product.model_name?.trim() ||
    decodeURIComponent(product_slug.replace(/-/g, " "));
  const description =
    plainProductDescription(product.description) ||
    `Buy ${product.model_name ?? heading} online at ${SITE_NAME}. ₹${product.price} (MRP ₹${product.listing_price}).`;
  const ogImage = getProductOgImage(product, model_number);
  const title = `${heading} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: product.tags?.slice(0, 20),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: ogImage
        ? [{ url: ogImage, alt: product.model_name ?? heading }]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
    },
  };
}

const ProductDetailsPage = async ({
  params,
}: ProductDetailsPageProps) => {
  const { product_slug, model_number } = await params;
  const cookieStore = await cookies();
  const isMobile = await isMobileDevice();
  const token = cookieStore.get(TOKENS.AUTH_TOKEN)?.value;
  const product = await fetchProductDetails(product_slug, {
    model_number,
    token,
  });

  if (!product) {
    notFound();
  }

  const selectedPc =
    product.product_colors?.find(
      (pc) => String(pc.model_number) === String(model_number),
    ) ?? product.product_colors?.[0];

  if (isMobile) {
    return (
      <ProductDetailsMobileView
        isMobile={isMobile}
        product={product}
        productSlug={product_slug}
        modelNumber={model_number}
      />
    );
  }

  return (
    <>
      <Navigation />
      <div>
        <ProductViewTracker
          slug={product_slug}
          model_number={model_number}
          product_color_id={selectedPc?.id}
        />
        <div className="grid place-content-center w-full pt-4">
          <PersistedColorSwitcher
            product_colors={product.product_colors}
            product_slug={product_slug}
            model_number={model_number}
          />
        </div>

        <div className="app-container grid grid-cols-12 gap-4 md:gap-6 lg:gap-12 xl:gap-20 mt-4 py-6">
          <div className="col-span-12 lg:col-span-8">
            <GalleryCarousel product_colors={product?.product_colors} />
            <ProductEmbeddingsSection
              className="mt-6"
              embeddings={selectedPc?.embeddings}
            />
            <RelatedBanners
              categoryId={product?.category?.id}
              shapeId={product?.shape?.id}
            />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Title and Wishlist button */}
            <div className="flex-shrink-0 flex gap-2">
              <div className="flex-grow">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {product?.category?.title}
                </p>
                <h1 className="mt-1 text-base font-semibold leading-snug text-foreground md:text-lg">
                  {product?.model_name}
                </h1>
              </div>
              {selectedPc?.id ? (
                <ShareProductButton
                  productColorId={selectedPc.id}
                  pathname={`/${product_slug}/${model_number}`}
                  productTitle={product?.model_name}
                />
              ) : null}
              {selectedPc?.id ? (
                <WishlistButton
                  productColorId={selectedPc.id}
                  initialWishlisted={product.is_wishlisted}
                />
              ) : null}
            </div>

            {/* Price and discount */}
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
                <Link href={`/blog/size-guide`}>
                  <Badge variant="secondary" className="border border-border">
                    {product?.frame_size?.join(",")}
                  </Badge>
                </Link>
              </div>
            </div>

            {/* Product details */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                {/* Frame Width */}
                <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
                  <div className="text-xs text-muted-foreground">{product?.frame_width} mm</div>
                  <div className="relative grid place-content-center">
                    <span className="relative flex items-center w-full mb-1">
                      <span className="block w-[80%] mx-auto h-[2px] bg-destructive" />
                    </span>
                    <Image src="/lens-only.png" alt="lens-only" width={100} height={100} />
                  </div>
                  <div className="text-xs font-semibold text-foreground">Frame Width</div>
                </div>
                {/* Lens Width */}
                <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
                  <div className="text-xs text-muted-foreground">{product?.lens_width} mm</div>
                  <div className="relative grid place-content-center">
                    <span className="absolute top-1/2 -translate-y-1/2 left-1.5 w-[35px] block h-[2px] bg-destructive" />
                    <Image src="/lens-only.png" alt="lens-only" width={100} height={100} />
                  </div>
                  <div className="text-xs font-semibold text-foreground">Lens Width</div>
                </div>

                {/* Lens Height */}
                <div className="col-span-1 row-span-1 flex flex-col gap-2 items-center justify-center max-w-32 p-4 rounded-md">
                  <div className="text-xs text-muted-foreground">{product?.lens_height} mm</div>
                  <div className="relative grid place-content-center">
                    <span className="absolute top-1/2 -translate-y-1/2 left-[22px] h-[30px] block w-[2px] bg-destructive" />
                    <Image src="/lens-only.png" alt="lens-only" width={100} height={100} />
                  </div>
                  <div className="text-xs font-semibold text-foreground">Lens Height</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Size Guide */}
                <Link
                  href="/blog/size-guide"
                  className="rounded-md border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <h4 className="mb-1 text-lg font-semibold text-foreground">
                    Know your size?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Find the perfect frame size for your face.{" "}
                    <span className="text-primary underline underline-offset-2">
                      Learn more
                    </span>
                  </p>
                </Link>

                {/* Buy Guide */}
                <Link
                  href="/blog/how-to-buy"
                  className="rounded-md border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <h4 className="mb-1 text-lg font-semibold text-foreground">
                    How to buy?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    A step-by-step guide to ordering frames and lenses.{" "}
                    <span className="text-primary underline underline-offset-2">
                      Learn more
                    </span>
                  </p>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-gradient-to-r from-green-500/10 to-orange-500/10 p-3 dark:from-green-500/15 dark:to-orange-500/10 sm:grid-cols-2 sm:gap-0 sm:p-2">
                <div className="flex items-center gap-3">
                  <Truck className="size-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Free Shipping</p>
                    <p className="text-xs text-muted-foreground md:text-sm">Across India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="size-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Premium Quality</p>
                    <p className="text-xs text-muted-foreground md:text-sm">Imported International</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-4" />

            {/* Purchase frame only and select lens */}
            <ProductPurchaseAction product={product} />

            <Separator className="my-4" />
            <CollapsibleProductInfo product={product} />
            <CollapsibleDetail description={product?.description} title={product?.seo_title} />
            <CollapsibleDetail description={product?.tags?.join(", ")} title="Tags" />
          </div>
        </div>
        <RelatedShapeProducts
          shapeSlug={product?.shape?.slug}
          shapeTitle={product?.shape?.title}
          excludeProductColorId={selectedPc?.id}
        />
      </div>
      <Footer />
    </>
  );
};
export default ProductDetailsPage;
