"use client";

import { useProductViewEffect } from "../hooks/useProductViewEffect";

export type ProductViewTrackerProps = {
  slug: string;
  model_number?: string;
  product_color_id?: string;
};

/**
 * Client-only: records one product view per page load for the given variant.
 */
export default function ProductViewTracker({
  slug,
  model_number,
  product_color_id,
}: ProductViewTrackerProps) {
  useProductViewEffect(slug, {
    ...(product_color_id && { product_color_id }),
    ...(model_number != null &&
      String(model_number).length > 0 && { model_number: String(model_number) }),
  });
  return null;
}
