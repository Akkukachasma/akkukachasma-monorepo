import type { IPaginatedResponse } from "@/lib/types";
import { SITEMAP_PAGE_SIZE } from "./config";
import { getSitemapApiClient } from "./api-client";

export async function fetchAllPages<T>(
  endpoint: string,
  pageSize: number = SITEMAP_PAGE_SIZE,
): Promise<T[]> {
  const client = getSitemapApiClient();
  const items: T[] = [];
  let page = 1;
  let total = Infinity;

  while ((page - 1) * pageSize < total) {
    const response = await client.get<IPaginatedResponse<T>>(endpoint, {
      params: { page, page_size: pageSize },
    });
    const body = response.data;
    const batch = body.data ?? [];
    items.push(...batch);
    total = body.total ?? items.length;
    if (batch.length === 0 || batch.length < pageSize) break;
    page += 1;
  }

  return items;
}

export async function fetchAllPagesSafe<T>(
  label: string,
  endpoint: string,
  pageSize: number = SITEMAP_PAGE_SIZE,
): Promise<T[]> {
  try {
    return await fetchAllPages<T>(endpoint, pageSize);
  } catch (error) {
    console.error(`[sitemap] Failed to fetch ${label}:`, error);
    return [];
  }
}
