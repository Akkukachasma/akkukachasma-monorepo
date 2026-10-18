"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ICategoryProductsResponse, ISeparatedProduct } from "@/lib/types";
import ProductCard1 from "../cards/ProductCard1";
import ProductCardSkeleton from "../cards/ProductCardSkeleton";
import useSeparatedProducts from "../../queries/useSeparatedProducts";
import { FilterSheet, FloatingFilterButton } from "@/features/product-filters";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  IProductResultFilters,
  resetFilters,
  setFilters,
} from "@/store/product-results.slice";
import type { ISearchParams } from "@/store/product-results.slice";
import { ProductListingPagination } from "../ProductListingPagination";
import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  parseListingLimit,
  parseListingPage,
} from "../../lib/parse-listing-query";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

function countActiveFilters(filters: IProductResultFilters): number {
  let count = 0;
  if (Array.isArray(filters.color_ids) && filters.color_ids.length) count += 1;
  if (Array.isArray(filters.shape_ids) && filters.shape_ids.length) count += 1;
  if (Array.isArray(filters.frame_width) && filters.frame_width.length)
    count += 1;
  if (Array.isArray(filters.lens_width) && filters.lens_width.length)
    count += 1;
  if (Array.isArray(filters.frame_size) && filters.frame_size.length) count += 1;
  return count;
}

interface ProductResultProps {
  initialData: ICategoryProductsResponse<ISeparatedProduct>;
  endpoint: string;
  initialSearchParams?: ISearchParams;
  /** Server-rendered listing page (for cache + SSR alignment). */
  initialPagination?: { page: number; pageSize: number };
}

const ProductResult: React.FC<ProductResultProps> = ({
  initialData,
  endpoint,
  initialSearchParams,
  initialPagination = {
    page: initialData.page ?? 1,
    pageSize: initialData.page_size ?? DEFAULT_PRODUCT_PAGE_SIZE,
  },
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const filters = useAppSelector((store) => store.productResultStore.filters);

  const page = parseListingPage(searchParams.get("page"));
  const pageSize = parseListingLimit(
    searchParams.get("limit"),
    initialPagination.pageSize,
  );

  const updateListingParams = useCallback(
    (next: { page?: number; limit?: number }) => {
      const p = new URLSearchParams(searchParams.toString());
      if (next.page !== undefined) {
        if (next.page <= 1) p.delete("page");
        else p.set("page", String(next.page));
      }
      if (next.limit !== undefined) {
        if (next.limit === initialPagination.pageSize) p.delete("limit");
        else p.set("limit", String(next.limit));
      }
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      pathname,
      router,
      searchParams,
      initialPagination.pageSize,
    ],
  );

  const {
    data,
    total,
    totalPages,
    isLoading,
    isFetching,
  } = useSeparatedProducts({
    endpoint,
    initialData,
    initialSearchParams,
    page,
    pageSize,
    initialPagination,
  });

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [
    filters,
  ]);

  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);
  const prevFiltersKey = useRef<string | null>(null);
  useEffect(() => {
    if (prevFiltersKey.current === null) {
      prevFiltersKey.current = filtersKey;
      return;
    }
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      if (page !== 1) updateListingParams({ page: 1 });
    }
  }, [filtersKey, page, updateListingParams]);

  const prevEndpoint = useRef(endpoint);
  useEffect(() => {
    if (prevEndpoint.current !== endpoint) {
      prevEndpoint.current = endpoint;
      if (page !== 1) updateListingParams({ page: 1 });
    }
  }, [endpoint, page, updateListingParams]);

  useEffect(() => {
    dispatch(resetFilters());
  }, [endpoint, dispatch]);

  useEffect(() => {
    if (!isFetching && total > 0 && page > totalPages) {
      updateListingParams({ page: totalPages });
    }
  }, [isFetching, total, page, totalPages, updateListingParams]);

  const prevPage = useRef(page);
  useEffect(() => {
    if (prevPage.current !== page) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevPage.current = page;
  }, [page]);

  if (isLoading && (!data || data.length === 0)) {
    return (
      <>
        <div className="app-container grid grid-cols-12 min-h-[80vh] gap-4">
          <div className="col-span-12 grid grid-cols-12 grid-rows-10 gap-4 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton
                key={`initial-skeleton-${i}`}
                className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3"
              />
            ))}
          </div>
        </div>
        <FilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          endpoint={endpoint}
          initialSearchParams={initialSearchParams}
          initialFilters={initialData.filters}
          currentFilters={filters}
          onApply={(next) => dispatch(setFilters(next))}
        />
        <FloatingFilterButton
          onClick={() => setFilterSheetOpen(true)}
          filterCount={activeFilterCount}
        />
      </>
    );
  }

  if (data?.length === 0) {
    return (
      <>
        <div className="app-container grid grid-cols-12 min-h-[80vh] gap-4 py-4">
          <div className="col-span-12">
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your filters or browse all categories."
              className="min-h-[60vh]"
            >
              <Button
                type="button"
                variant="outline"
                className="rounded-3xl"
                onClick={() => setFilterSheetOpen(true)}
              >
                Adjust filters
              </Button>
            </EmptyState>
          </div>
        </div>
        <FilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          endpoint={endpoint}
          initialSearchParams={initialSearchParams}
          initialFilters={initialData.filters}
          currentFilters={filters}
          onApply={(next) => dispatch(setFilters(next))}
        />
        <FloatingFilterButton
          onClick={() => setFilterSheetOpen(true)}
          filterCount={activeFilterCount}
        />
      </>
    );
  }

  return (
    <>
      <div className="app-container grid grid-cols-12 min-h-[80vh] gap-4">
        <div className="relative col-span-12 py-4">
          {isFetching && !isLoading ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-background/40"
              aria-hidden
            />
          ) : null}
          <div className="grid grid-cols-12 gap-4">
            {data?.map((product, index) => (
              <ProductCard1
                className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3"
                index={index}
                key={product.id || `${product.product_id}-${product.model_number}-${index}`}
                data={product}
              />
            ))}
          </div>
          <div className="col-span-12 mt-6">
            <ProductListingPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              isLoading={isFetching}
              onPageChange={(p) => updateListingParams({ page: p })}
              onPageSizeChange={(size) =>
                updateListingParams({ page: 1, limit: size })
              }
            />
          </div>
        </div>
      </div>

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        endpoint={endpoint}
        initialSearchParams={initialSearchParams}
        initialFilters={initialData.filters}
        currentFilters={filters}
        onApply={(next) => dispatch(setFilters(next))}
      />
      <FloatingFilterButton
        onClick={() => setFilterSheetOpen(true)}
        filterCount={activeFilterCount}
      />
    </>
  );
};
export default ProductResult;
