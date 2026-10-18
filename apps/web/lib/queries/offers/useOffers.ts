import React from "react";
import { getApiClient } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { ICoupon } from "@/components/coupon-manager/ListItem";

const useOffers = () => {
  const [total, setTotal] = React.useState(0);
  const api = getApiClient();
  // Get sort_by selection

  const page_size = 10; // Number of records per page.

  const result = useInfiniteQuery<ICoupon[]>({
    initialPageParam: 1,
    queryKey: ["coupons"],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam?.toString(),
        page_size: page_size?.toString(),
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(ENDPOINTS.offers.fetch_all(queryString));

      setTotal(response?.data?.total);
      return response.data?.data;
    },
    getNextPageParam: (_lastPage, allPages) => {
      const totalAvailablePages = Math.ceil(total / page_size);
      return allPages?.length < totalAvailablePages
        ? allPages.length + 1
        : undefined;
    },
  });

  const offers = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []);
  }, [result?.data]);

  return {
    data: offers,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
  };
};

export default useOffers;
