import ProductResult from "@/features/products/components/product-result";
import ENDPOINTS from "@/lib/endpoints";
import { fetchSearchProducts } from "@/features/hero-search/services/hero-search.service";
import type { ICategoryProductsResponse, ISeparatedProduct } from "@/lib/types";
import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  parseListingLimit,
  parseListingPage,
} from "@/features/products/lib/parse-listing-query";

const EMPTY_SEARCH_DATA: ICategoryProductsResponse<ISeparatedProduct> = {
  data: [],
  total: 0,
  page: 1,
  page_size: DEFAULT_PRODUCT_PAGE_SIZE,
  success: true,
};

interface SearchPageProps {
  searchParams: Promise<{
    gender?: string;
    category_slug?: string;
    shape_slug?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

const SearchResultPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams;
  const searchParamsForApi = {
    gender: params.gender,
    category_slug: params.category_slug,
    shape_slug: params.shape_slug,
    search: params.search,
  };

  const page = parseListingPage(params.page);
  const pageSize = parseListingLimit(params.limit);

  let data = EMPTY_SEARCH_DATA;
  try {
    data = await fetchSearchProducts(searchParamsForApi, {
      page,
      page_size: pageSize,
    });
  } catch {
    data = EMPTY_SEARCH_DATA;
  }

  return (
    <ProductResult
      endpoint={ENDPOINTS.products.search}
      initialData={data}
      initialSearchParams={searchParamsForApi}
      initialPagination={{ page, pageSize }}
    />
  );
};

export default SearchResultPage;
