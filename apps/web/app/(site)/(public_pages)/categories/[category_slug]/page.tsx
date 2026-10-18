import ListingEntityContent from "@/features/products/components/ListingEntityContent";
import ProductResult from "@/features/products/components/product-result";
import ENDPOINTS from "@/lib/endpoints";
import { stripHtmlForMeta } from "@/lib/utils";
import {
  fetchCategoryBySlug,
  fetchCategoryProducts,
} from "@/services/category.service";
import {
  parseListingLimit,
  parseListingPage,
} from "@/features/products/lib/parse-listing-query";
import type { Metadata } from "next";
import { cache } from "react";

interface CategoryResultPageProps {
  params: Promise<{ category_slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

const SITE_NAME = "Akku Ka Chasma";
const SITE_ORIGIN = "https://akkukachasma.com";

const getCategory = cache(async (slug: string) => {
  try {
    return await fetchCategoryBySlug(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: CategoryResultPageProps): Promise<Metadata> {
  const { category_slug } = await params;
  const category = await getCategory(category_slug);
  const fallbackLabel = decodeURIComponent(category_slug.replace(/-/g, " "));

  if (!category) {
    return {
      title: fallbackLabel,
      description: `Shop ${fallbackLabel} online at ${SITE_NAME}.`,
    };
  }

  // Browser tab / SERP title uses SEO title when set.
  const pageTitle = category.seo_title?.trim() || category.title;
  const plainDescription = stripHtmlForMeta(
    category.meta_description || category.description,
  );
  const description =
    plainDescription ||
    `Shop ${category.title} eyeglasses and sunglasses online at ${SITE_NAME}.`;

  const canonical = `${SITE_ORIGIN}/categories/${category.slug}`;

  return {
    title: pageTitle,
    description,
    keywords: category.keywords?.length
      ? category.keywords.slice(0, 20)
      : undefined,
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: category.image?.url
        ? [{ url: category.image.url, alt: category.title }]
        : undefined,
    },
    twitter: {
      card: category.image?.url ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      images: category.image?.url ? [category.image.url] : undefined,
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

const CategoryResultPage = async ({
  params,
  searchParams,
}: CategoryResultPageProps) => {
  const { category_slug } = await params;
  const sp = await searchParams;
  const page = parseListingPage(sp.page);
  const pageSize = parseListingLimit(sp.limit);

  const [category, data] = await Promise.all([
    getCategory(category_slug),
    fetchCategoryProducts(category_slug, {
      page,
      page_size: pageSize,
    }),
  ]);

  return (
    <>
      <ProductResult
        endpoint={ENDPOINTS.products.category_products(category_slug)}
        initialData={data}
        initialPagination={{ page, pageSize }}
      />
      {category ? (
        <ListingEntityContent
          title={category.title}
          description={category.description}
          keywords={category.keywords}
        />
      ) : null}
    </>
  );
};
export default CategoryResultPage;
