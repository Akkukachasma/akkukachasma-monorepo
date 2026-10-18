import React from "react";
import { getApiClient } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/lens-details/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { ILensDetail } from "@/components/lens-details/LensDetail";
interface UseLensDetails {
  lens_feature_id?: string;
}
const useLensDetails = (param?: UseLensDetails) => {
  const { lens_feature_id } = param || {};
  const dispatch = useAppDispatch();
  const api = getApiClient();
  // Get sort_by selection
  const { sort_by, total, search_term } = useAppSelector(
    (store) => store.lensDetailStore.dataStore,
  );

  const page_size = 10; // Number of records per page.

  const result = useInfiniteQuery<ILensDetail[]>({
    initialPageParam: 1,
    queryKey: ["lens-details", search_term, sort_by, lens_feature_id],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam?.toString(),
        sort_by,
        page_size: page_size?.toString(),
        search_term: search_term.query_string,
        lens_feature_id: lens_feature_id,
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.lens_details.fetch_all(queryString),
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
    enabled: lens_feature_id !== undefined ? Boolean(lens_feature_id) : true,
  });

  const lens_details = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, []);
  }, [result?.data]);

  return {
    data: lens_details,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
  };
};

export default useLensDetails;
