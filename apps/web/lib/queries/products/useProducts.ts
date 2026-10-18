import React from "react";
import { getApiClient } from "@/lib/api";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/product-results.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { IProduct } from "@/components/products/ListItem";
import { IPaginatedResponse } from "@/lib/types";

const useProducts = (
  endpoint: string,
  initialData: IPaginatedResponse<IProduct>,
) => {
  const dispatch = useAppDispatch();
  const api = getApiClient();
  // Get sort_by selection
  const { sort_by, total, search_term } = useAppSelector(
    (store) => store.productResultStore,
  );

  const page_size = 20; // Number of records per page.

  const result = useInfiniteQuery<IProduct[]>({
    initialPageParam: 1,
    queryKey: ["products"],
    // queryKey: ["power-types", search_term, sort_by],
    queryFn: async ({ pageParam }) => {
      // if (initialData) {
      //   return initialData.data;
      // }
      const filterObj = {
        page: pageParam?.toString(),
        // sort_by,
        page_size: page_size?.toString(),
        // search_term,
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(endpoint + "?" + queryString);

      dispatch(setTotal(response?.data?.total));
      return response.data?.data;
    },
    getNextPageParam: (_lastPage, allPages) => {
      const totalAvailablePages = Math.ceil(total / page_size);
      return allPages?.length < totalAvailablePages
        ? allPages.length + 1
        : undefined;
    },
  });

  const products = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, [] as IProduct[]);
  }, [result?.data]);

  return {
    data: products,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
  };
};

export default useProducts;
