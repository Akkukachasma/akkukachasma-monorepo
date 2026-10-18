import { ICategory } from "@/components/categories/ListItem";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import {
  ICategoryProductsResponse,
  IPaginatedResponse,
  ISeparatedProduct,
} from "@/lib/types";
import {
  generateQueryString,
  type GenerateQueryStringParams,
} from "@/lib/utils";
import type { IProductResultFilters } from "@/store/product-results.slice";

const api = getApiClient();

export const fetchCategoryBySlug = async (slug: string): Promise<ICategory> => {
  const response = await api.get(ENDPOINTS.products.category_by_slug(slug));
  return response?.data?.data;
};

export const getCategories = async (): Promise<
  IPaginatedResponse<ICategory>
> => {
  const response = await api.get(ENDPOINTS.admin.categories.fetch_all());
  return response?.data;
};

export const fetchCategoryProducts = async (
  category_slug: string,
  filters?: IProductResultFilters & { page?: number; page_size?: number }
): Promise<ICategoryProductsResponse<ISeparatedProduct>> => {
  const queryString = filters
    ? generateQueryString(filters as GenerateQueryStringParams)
    : "";
  const url = ENDPOINTS.products.category_products(category_slug);
  const response = await api.get(
    queryString ? `${url}?${queryString}` : url
  );
  return response?.data;
};
