import React from "react";
import { getApiClient, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { generateQueryString } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

interface GetActivitiesParams {
  page_size?: number;
  search_term?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  type?: string;
}

interface ActivityUser {
  id: string;
  name: string;
  email: string;
}

export type ActivityTypeValue =
  | "INFO"
  | "SUCCESS"
  | "ERROR"
  | "WARNING"
  | "ALERT";

export interface Activity {
  id: string;
  created_at: string;
  type?: ActivityTypeValue;
  title?: string;
  description?: string | null;
  detail: Record<string, unknown>;
  user_id: string | null;
  user: ActivityUser | null;
}

interface GetActivitiesResponse {
  success: boolean;
  data: Activity[];
  total: number;
  page: number;
  page_size: number;
}

const useGetActivities = (params: GetActivitiesParams = {}) => {
  const api = getApiClient();
  const { page_size = 12, ...restParams } = params;

  const result = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [
      "admin-activities",
      params.search_term ?? "",
      params.sort_by ?? "",
      params.type ?? "",
      params.page_size?.toString() ?? "12",
    ],
    queryFn: async ({ pageParam }) => {
      const filterObj = {
        page: pageParam.toString(),
        page_size: page_size.toString(),
        search_term: params.search_term,
        sort_by: params.sort_by,
        type: params.type,
        start_date: params.start_date,
        end_date: params.end_date,
        ...restParams,
      };

      const queryString = generateQueryString(filterObj);
      const response = await api.get(
        ENDPOINTS.activities.fetch_all(queryString),
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(
        lastPage.total / (lastPage.page_size || page_size),
      );
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
  });

  const activities = React.useMemo(() => {
    return result.data?.pages.flatMap((p) => p.data) ?? [];
  }, [result.data]);

  const total = result.data?.pages?.[0]?.total ?? 0;

  return {
    data: activities,
    total,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
    refetch: result.refetch,
  };
};

export default useGetActivities;
