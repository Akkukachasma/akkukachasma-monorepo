import ListingEntityContent from "@/features/products/components/ListingEntityContent";
import ProductResult from "@/features/products/components/product-result";
import ENDPOINTS from "@/lib/endpoints";
import { stripHtmlForMeta } from "@/lib/utils";
import { fetchShapeBySlug, fetchShapeProducts } from "@/services/shape.service";
import {
  parseListingLimit,
  parseListingPage,
} from "@/features/products/lib/parse-listing-query";
import type { Metadata } from "next";
import { cache } from "react";

interface ShapeResultPageProps {
  params: Promise<{ shape_slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

const SITE_NAME = "Akku Ka Chasma";
const SITE_ORIGIN = "https://akkukachasma.com";

const getShape = cache(async (slug: string) => {
  try {
    return await fetchShapeBySlug(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: ShapeResultPageProps): Promise<Metadata> {
  const { shape_slug } = await params;
  const shape = await getShape(shape_slug);
  const fallbackLabel = decodeURIComponent(shape_slug.replace(/-/g, " "));

  if (!shape) {
    return {
      title: fallbackLabel,
      description: `Shop ${fallbackLabel} eyeglasses and sunglasses online at ${SITE_NAME}.`,
    };
  }

  // Browser tab / SERP title uses SEO title when set.
  const pageTitle = shape.seo_title?.trim() || shape.title;
  const plainDescription = stripHtmlForMeta(
    shape.meta_description || shape.description,
  );
  const description =
    plainDescription ||
    `Shop ${shape.title} eyeglasses and sunglasses online at ${SITE_NAME}.`;

  const canonical = `${SITE_ORIGIN}/shapes/${shape.slug}`;

  return {
    title: pageTitle,
    description,
    keywords: shape.keywords?.length ? shape.keywords.slice(0, 20) : undefined,
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: shape.image?.url
        ? [{ url: shape.image.url, alt: shape.title }]
        : undefined,
    },
    twitter: {
      card: shape.image?.url ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      images: shape.image?.url ? [shape.image.url] : undefined,
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

const ShapeResultPage = async ({
  params,
  searchParams,
}: ShapeResultPageProps) => {
  const { shape_slug } = await params;
  const sp = await searchParams;
  const page = parseListingPage(sp.page);
  const pageSize = parseListingLimit(sp.limit);

  const [shape, data] = await Promise.all([
    getShape(shape_slug),
    fetchShapeProducts(shape_slug, {
      page,
      page_size: pageSize,
    }),
  ]);

  return (
    <>
      <ProductResult
        endpoint={ENDPOINTS.products.shape_products(shape_slug)}
        initialData={data}
        initialPagination={{ page, pageSize }}
      />
      {shape ? (
        <ListingEntityContent
          title={shape.title}
          description={shape.description}
          keywords={shape.keywords}
        />
      ) : null}
    </>
  );
};
export default ShapeResultPage;
