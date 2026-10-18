import type { MetadataRoute } from "next";
import type { IArticle } from "@/components/articles/ListItem";
import type { ICategory } from "@/components/categories/ListItem";
import type { IShape } from "@/components/shapes/ListItem";
import type { ISeparatedProduct } from "@/lib/types";
import { absoluteUrl } from "./config";
import ENDPOINTS from "@/lib/endpoints";
import { fetchAllPagesSafe } from "./fetch-all";

function parseLastModified(updatedAt?: string): Date | undefined {
  if (!updatedAt) return undefined;
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function productSitemapEntries(
  products: ISeparatedProduct[],
): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const item of products) {
    const slug = item.product?.slug?.trim();
    const modelNumber = item.model_number?.trim();
    if (!slug || !modelNumber) continue;

    const path = `/${slug}/${modelNumber}`;
    if (seen.has(path)) continue;
    seen.add(path);

    entries.push({
      url: absoluteUrl(path),
      lastModified: parseLastModified(item.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}

export function categorySitemapEntries(
  categories: ICategory[],
): MetadataRoute.Sitemap {
  return categories
    .filter((c) => c.slug?.trim())
    .map((c) => ({
      url: absoluteUrl(`/categories/${c.slug.trim()}`),
      lastModified: parseLastModified(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

export function shapeSitemapEntries(shapes: IShape[]): MetadataRoute.Sitemap {
  return shapes
    .filter((s) => s.slug?.trim())
    .map((s) => ({
      url: absoluteUrl(`/shapes/${s.slug.trim()}`),
      lastModified: parseLastModified(s.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

export function articleSitemapEntries(
  articles: IArticle[],
): MetadataRoute.Sitemap {
  return articles
    .filter((a) => a.slug?.trim())
    .map((a) => ({
      url: absoluteUrl(`/blog/${a.slug.trim()}`),
      lastModified: parseLastModified(a.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

export async function fetchDynamicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, shapes, articles] = await Promise.all([
    fetchAllPagesSafe<ISeparatedProduct>("products", ENDPOINTS.products.search),
    fetchAllPagesSafe<ICategory>(
      "categories",
      ENDPOINTS.admin.categories.fetch_all(),
    ),
    fetchAllPagesSafe<IShape>("shapes", ENDPOINTS.admin.shapes.fetch_all()),
    fetchAllPagesSafe<IArticle>("articles", ENDPOINTS.blog.fetch_published),
  ]);

  return [
    ...productSitemapEntries(products),
    ...categorySitemapEntries(categories),
    ...shapeSitemapEntries(shapes),
    ...articleSitemapEntries(articles),
  ];
}
