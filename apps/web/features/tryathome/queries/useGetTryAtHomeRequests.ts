import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/features/tryathome/store";
import { generateQueryString } from "@/lib/utils";

export interface GetTryAtHomeRequestsParams {
  sort_by?: string;
  search_term?: string;
  purpose_id?: string;
  start_date?: string;
  end_date?: string;
  page_size?: number;
}

export interface TryAtHomeRequest {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  message?: string;
  created_at: string;
  purpose?: {
    id: string;
    label: string;
  };
  address?: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface GetTryAtHomeRequestsResponse {
  data: TryAtHomeRequest[];
  total: number;
  page: number;
  page_size: number;
}

const useGetTryAtHomeRequests = (params: GetTryAtHomeRequestsParams = {}) => {
  const api = getApiClient();
  const { page_size = 12, ...restParams } = params;
  const dispatch = useAppDispatch();
  const { total, search_term, sort_by, purpose_id, start_date, end_date } =
    useAppSelector((state) => state.tryAtHomeRequests.data);

  const result = useInfiniteQuery<TryAtHomeRequest[]>({
    initialPageParam: 1,
    queryKey: [
      "admin-tryathome-requests",
      search_term,
      sort_by,
      purpose_id,
      start_date,
      end_date,
    ],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam?.toString(),
        page_size: page_size?.toString(),
        search_term,
        sort_by,
        purpose_id,
        start_date,
        end_date,
        ...restParams, // Allow override from params
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.tryathome.requests.fetch_all(queryString),
      );

      if (response?.data?.total !== undefined) {
        dispatch(setTotal(response?.data?.total));
      }
      return response.data.data;
    },
    getNextPageParam: (_lastPage, allPages) => {
      const totalAvailablePages = Math.ceil(total / page_size);
      return allPages?.length < totalAvailablePages
        ? allPages.length + 1
        : undefined;
    },
  });

  const requests = React.useMemo(() => {
    return result.data?.pages.reduce((acc, page) => {
      return [...acc, ...page];
    }, [] as TryAtHomeRequest[]);
  }, [result.data]);

  return {
    data: requests,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
    refetch: result.refetch,
    query: result,
    total,
  };
};

export default useGetTryAtHomeRequests;
