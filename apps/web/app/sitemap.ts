import type { MetadataRoute } from "next";
import { staticSitemapEntries } from "@/lib/sitemap/config";
import { fetchDynamicSitemapEntries } from "@/lib/sitemap/entries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamic = await fetchDynamicSitemapEntries();
  return [...staticSitemapEntries(), ...dynamic];
}
