import type { IShape } from "@/components/shapes/ListItem";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import {
  generateQueryString,
  type GenerateQueryStringParams,
} from "@/lib/utils";

const api = getApiClient();

export const fetchShapeBySlug = async (slug: string): Promise<IShape> => {
  const response = await api.get(ENDPOINTS.products.shape_by_slug(slug));
  return response?.data?.data;
};

export const fetchShapeProducts = async (
  shape_slug: string,
  extra?: { page?: number; page_size?: number },
) => {
  const qs = extra
    ? generateQueryString(extra as GenerateQueryStringParams)
    : "";
  const base = ENDPOINTS.products.shape_products(shape_slug);
  const response = await api.get(qs ? `${base}?${qs}` : base);
  return response?.data;
};
