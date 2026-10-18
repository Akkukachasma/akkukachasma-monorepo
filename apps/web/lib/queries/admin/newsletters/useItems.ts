import React from "react";
import { getApiClient } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/newsletters/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { INewsletterSubscriber } from "@/components/newsletters/ListItem";

interface UseItems {
  completeFetch?: boolean;
}

const useItems = (configs?: UseItems) => {
  const { completeFetch = false } = configs || {};
  const dispatch = useAppDispatch();
  const api = getApiClient();
  const { sort_by, total, search_term } = useAppSelector(
    (store) => store.newsletterStore.dataStore,
  );

  const page_size = completeFetch ? 1000 : 10;

  const result = useInfiniteQuery<INewsletterSubscriber[]>({
    initialPageParam: 1,
    queryKey: ["newsletters", search_term, sort_by],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam?.toString(),
        sort_by,
        page_size: page_size?.toString(),
        search_term: search_term,
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.newsletters.fetch_all(queryString),
      );

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

  const rows = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, [] as INewsletterSubscriber[]);
  }, [result?.data]);

  return {
    data: rows,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
  };
};

export default useItems;
