import React from "react";
import { getApiClient } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/lens-features/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { ILensFeature } from "@/components/lens-features/LensFeature";

interface UseLensFeature {
  completeFetch?: boolean;
  power_type_id?: string;
}

const useLensFeatures = (configs?: UseLensFeature) => {
  const { completeFetch = false, power_type_id } = configs || {};
  const dispatch = useAppDispatch();
  const api = getApiClient();
  // Get sort_by selection
  const { sort_by, total, search_term } = useAppSelector(
    (store) => store.lensFeatureStore.dataStore,
  );

  const page_size = completeFetch ? 1000 : 10; // Number of records per page.

  const result = useInfiniteQuery<ILensFeature[]>({
    initialPageParam: 1,
    queryKey: ["lens-features", search_term, sort_by, power_type_id],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam?.toString(),
        sort_by,
        page_size: page_size?.toString(),
        search_term,
        ...(power_type_id && { power_type_id }),
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.lens_features.fetch_all(queryString),
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

  const customers = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, [] as ILensFeature[]);
  }, [result?.data]);

  return {
    data: customers,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
  };
};

export default useLensFeatures;
