import type { ISeparatedProduct } from "@/lib/types";
import { fetchShapeProducts } from "@/services/shape.service";
import { getErrorMessage, type RequestError } from "@/lib/api";

export const RELATED_SHAPE_PRODUCTS_LIMIT = 10;
/** Larger page so rotate-after-current can vary across same-shape PDPs. */
const FETCH_PAGE_SIZE = 50;

export type RelatedShapeSlide =
  | { kind: "product"; id: string; product: ISeparatedProduct }
  | {
      kind: "view-more";
      id: "view-more";
      shapeSlug: string;
      shapeTitle?: string;
    };

export interface FetchRelatedShapeProductsParams {
  shapeSlug: string;
  excludeProductColorId?: string;
  shapeTitle?: string;
}

/** Next `limit` items after the current product in listing order (wraps). */
export function pickRelatedAfterCurrent(
  items: ISeparatedProduct[],
  excludeProductColorId: string | undefined,
  limit: number,
): ISeparatedProduct[] {
  if (!items.length || limit <= 0) return [];

  if (!excludeProductColorId) {
    return items.slice(0, limit);
  }

  const excludeIndex = items.findIndex(
    (item) => item.id === excludeProductColorId,
  );

  if (excludeIndex < 0) {
    // Current color not in this page — rotate by a stable hash so lists still differ.
    const pool = items;
    const offset = hashString(excludeProductColorId) % pool.length;
    return takeWrapping(pool, offset, limit);
  }

  const after = items.slice(excludeIndex + 1);
  const before = items.slice(0, excludeIndex);
  return [...after, ...before].slice(0, limit);
}

function takeWrapping<T>(items: T[], start: number, limit: number): T[] {
  if (!items.length) return [];
  const out: T[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    out.push(items[(start + i) % items.length]);
  }
  return out;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export async function fetchRelatedShapeSlides(
  params: FetchRelatedShapeProductsParams,
): Promise<RelatedShapeSlide[]> {
  const { shapeSlug, excludeProductColorId, shapeTitle } = params;
  if (!shapeSlug) return [];

  const response = await fetchShapeProducts(shapeSlug, {
    page: 1,
    page_size: FETCH_PAGE_SIZE,
  });

  const items = (response?.data ?? []) as ISeparatedProduct[];
  const related = pickRelatedAfterCurrent(
    items,
    excludeProductColorId,
    RELATED_SHAPE_PRODUCTS_LIMIT,
  );

  if (!related.length) return [];

  const slides: RelatedShapeSlide[] = related.map((product) => ({
    kind: "product",
    id: product.id,
    product,
  }));

  slides.push({
    kind: "view-more",
    id: "view-more",
    shapeSlug,
    shapeTitle,
  });

  return slides;
}

export { getErrorMessage };
export type { RequestError };
