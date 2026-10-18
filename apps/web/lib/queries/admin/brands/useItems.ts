import React from "react";
import { getApiClient } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/brands/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { IBrand } from "@/components/brands/ListItem";
interface UseItems {
    completeFetch?: boolean;
}
const useItems = (configs?: UseItems) => {
    const { completeFetch = false } = configs || {};
    const dispatch = useAppDispatch();
    const api = getApiClient();
    // Get sort_by selection
    const { sort_by, total, search_term } = useAppSelector(
        (store) => store.brandStore.dataStore,
    );

    const page_size = completeFetch ? 1000 : 10; // Number of records per page.

    const result = useInfiniteQuery<IBrand[]>({
        initialPageParam: 1,
        queryKey: ["brands", search_term, sort_by],
        queryFn: async ({ pageParam }) => {
            const filterObj = {
                page: pageParam?.toString(),
                sort_by,
                page_size: page_size?.toString(),
                search_term: search_term,
            };

            const queryString = generateQueryString(filterObj);

            const response = await api.get(
                ENDPOINTS.admin.brands.fetch_all(queryString),
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
        }, []);
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

export default useItems;
