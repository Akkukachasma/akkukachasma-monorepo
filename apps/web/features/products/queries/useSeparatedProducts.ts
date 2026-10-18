import React, { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/product-results.slice";
import { generateQueryString } from "@/lib/utils";
import type {
  IProductResultFilters,
  ISearchParams,
} from "@/store/product-results.slice";
import type {
  ICategoryProductFilters,
  ICategoryProductsResponse,
  ISeparatedProduct,
} from "@/lib/types";
import { DEFAULT_PRODUCT_PAGE_SIZE } from "../lib/parse-listing-query";

export type SeparatedProductsPageData = {
  items: ISeparatedProduct[];
  total: number;
  page: number;
  page_size: number;
  filters?: ICategoryProductFilters;
};

/** Serializes filters for use in queryKey (stable string representation) */
function filtersToKey(filters: IProductResultFilters): string {
  return JSON.stringify(filters ?? {});
}

export type UseSeparatedProductsArgs = {
  endpoint: string;
  initialData: ICategoryProductsResponse<ISeparatedProduct>;
  initialSearchParams?: ISearchParams;
  page: number;
  pageSize: number;
  /** When provided, `initialData` is used as `initialData` for this page only. */
  initialPagination?: { page: number; pageSize: number };
};

const useSeparatedProducts = ({
  endpoint,
  initialData,
  initialSearchParams,
  page,
  pageSize,
  initialPagination = { page: 1, pageSize: DEFAULT_PRODUCT_PAGE_SIZE },
}: UseSeparatedProductsArgs) => {
  const dispatch = useAppDispatch();
  const api = getApiClient();
  const { sort_by, total, filters, searchParams } = useAppSelector(
    (store) => store.productResultStore,
  );

  const isSearchEndpoint = endpoint.includes("/search");
  const effectiveSearchParams: ISearchParams | undefined = isSearchEndpoint
    ? searchParams && Object.keys(searchParams).length > 0
      ? searchParams
      : initialSearchParams
    : undefined;

  const hasNoFilters = !filters || Object.keys(filters).length === 0;
  const canUseInitialData =
    hasNoFilters &&
    initialData?.data != null &&
    initialData?.total != null &&
    page === initialPagination.page &&
    pageSize === initialPagination.pageSize;

  useEffect(() => {
    if (canUseInitialData && initialData.total != null) {
      dispatch(setTotal(initialData.total));
    }
  }, [canUseInitialData, initialData?.total, dispatch]);

  const searchParamsKey = isSearchEndpoint
    ? JSON.stringify(effectiveSearchParams ?? {})
    : "";

  const initialQueryData: SeparatedProductsPageData | undefined =
    canUseInitialData
      ? {
          items: initialData.data,
          total: initialData.total,
          page: initialData.page ?? page,
          page_size: initialData.page_size ?? pageSize,
          filters: initialData.filters,
        }
      : undefined;

  const query = useQuery({
    queryKey: [
      "separated-products",
      endpoint,
      sort_by,
      filtersToKey(filters),
      searchParamsKey,
      page,
      pageSize,
    ],
    queryFn: async (): Promise<SeparatedProductsPageData> => {
      const params: Record<string, string | number | string[] | undefined> = {
        page,
        page_size: pageSize,
        ...(sort_by ? { sort_by } : {}),
        ...(isSearchEndpoint && effectiveSearchParams?.category_slug
          ? { category_slug: effectiveSearchParams.category_slug }
          : {}),
        ...(isSearchEndpoint && effectiveSearchParams?.shape_slug
          ? { shape_slug: effectiveSearchParams.shape_slug }
          : {}),
        ...(isSearchEndpoint && effectiveSearchParams?.search
          ? { search: effectiveSearchParams.search }
          : {}),
        ...(isSearchEndpoint && effectiveSearchParams?.gender
          ? { gender: [effectiveSearchParams.gender] }
          : {}),
        ...(filters?.color_ids?.length ? { color_ids: filters.color_ids } : {}),
        ...(filters?.shape_ids?.length ? { shape_ids: filters.shape_ids } : {}),
        ...(filters?.frame_width?.length
          ? { frame_width: filters.frame_width.map(String) }
          : {}),
        ...(filters?.lens_width?.length
          ? { lens_width: filters.lens_width.map(String) }
          : {}),
        ...(filters?.frame_size?.length
          ? { frame_size: filters.frame_size }
          : {}),
      };
      const queryString = generateQueryString(params);
      const response = await api.get(`${endpoint}?${queryString}`);
      const body = response?.data as ICategoryProductsResponse<ISeparatedProduct>;
      dispatch(setTotal(body?.total ?? 0));
      return {
        items: body?.data ?? [],
        total: body?.total ?? 0,
        page: body?.page ?? page,
        page_size: body?.page_size ?? pageSize,
        filters: body?.filters,
      };
    },
    initialData: initialQueryData,
    placeholderData: keepPreviousData,
  });

  const data = query.data?.items ?? [];
  const resolvedTotal = query.data?.total ?? total;
  const totalPages = Math.max(1, Math.ceil((resolvedTotal || 0) / pageSize));

  return {
    data,
    total: resolvedTotal,
    totalPages,
    page: query.data?.page ?? page,
    pageSize: query.data?.page_size ?? pageSize,
    filters: query.data?.filters,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useSeparatedProducts;
