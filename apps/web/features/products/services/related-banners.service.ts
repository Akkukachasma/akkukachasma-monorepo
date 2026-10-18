import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { IBanner } from "@/components/banners/ListItem";

export interface FetchRelatedBannersParams {
  categoryId?: string;
  shapeId?: string;
}

export async function fetchRelatedBanners(
  params: FetchRelatedBannersParams
): Promise<IBanner[]> {
  const { categoryId, shapeId } = params;
  if (!categoryId && !shapeId) return [];

  const api = getApiClient();
  const response = await api.get(
    ENDPOINTS.admin.banners.fetch_related({
      category_id: categoryId,
      shape_id: shapeId,
    })
  );
  const data = response?.data?.data ?? [];
  return [...data].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}

export { getErrorMessage };
export type { RequestError };
