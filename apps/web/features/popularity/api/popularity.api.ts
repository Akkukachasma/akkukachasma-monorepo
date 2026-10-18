import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

export type RecordProductViewPayload = {
  product_color_id?: string;
  model_number?: string;
};

export async function recordProductView(
  slug: string,
  payload?: RecordProductViewPayload,
): Promise<void> {
  await getApiClient().patch(ENDPOINTS.products.record_views(slug), payload ?? {});
}

export async function recordProductShare(product_color_id: string): Promise<void> {
  await getApiClient().post(ENDPOINTS.popularity.record_share, {
    product_color_id,
  });
}
