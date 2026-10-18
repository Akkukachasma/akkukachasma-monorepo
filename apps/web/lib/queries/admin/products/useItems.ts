import React from "react";
import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPage, setTotal } from "@/store/products/data.slice";
import { generateQueryString } from "@/lib/utils";
import ENDPOINTS from "@/lib/endpoints";
import { IAdminProductListRow } from "@/components/products/ListItem";

const PAGE_SIZE = 30;

const useItems = () => {
  const dispatch = useAppDispatch();
  const api = getApiClient();
  const { sort_by, total, search_term, stock_tab, page } = useAppSelector(
    (store) => store.productStore.dataStore,
  );

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  React.useEffect(() => {
    if (page > pageCount) {
      dispatch(setPage(pageCount));
    }
  }, [page, pageCount, dispatch]);

  const result = useQuery({
    queryKey: ["products", page, PAGE_SIZE, search_term, sort_by, stock_tab],
    queryFn: async () => {
      const filterObj: Record<string, string> = {
        page: String(page),
        page_size: String(PAGE_SIZE),
        ...(sort_by ? { sort_by } : {}),
        ...(search_term.trim() ? { search: search_term.trim() } : {}),
        ...(stock_tab === "out_of_stock" ? { stock_scope: stock_tab } : {}),
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.products.fetch_all(queryString),
      );

      dispatch(setTotal(response?.data?.total ?? 0));
      return (response.data?.data ?? []) as IAdminProductListRow[];
    },
  });

  return {
    data: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isPlaceholderData: result.isPlaceholderData,
    page,
    pageCount,
    pageSize: PAGE_SIZE,
    total,
  };
};

export default useItems;
