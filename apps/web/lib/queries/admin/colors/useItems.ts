import React from "react";
import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTotal } from "@/store/colors/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { IColor } from "@/components/colors/ListItem";

const useItems = () => {
    const dispatch = useAppDispatch();
    const api = getApiClient();
    // Get sort_by selection
    const { sort_by, search_term } = useAppSelector(
        (store) => store.colorStore.dataStore,
    );

    const result = useQuery<IColor[]>({
        queryKey: ["colors", search_term, sort_by],
        queryFn: async () => {
            const filterObj = {
                sort_by,
                search_term: search_term,
            };

            const queryString = generateQueryString(filterObj);

            const response = await api.get(
                ENDPOINTS.admin.colors.fetch_all(queryString),
            );

            dispatch(setTotal(response?.data?.total));
            return response.data?.data;
        },
    });

    return result;
};

export default useItems;
