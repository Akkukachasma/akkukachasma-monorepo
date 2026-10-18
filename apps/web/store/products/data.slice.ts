import { IDeleteRecord } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

export type ProductListStockTab = "all" | "out_of_stock";

type InitialState = {
  itemToDelete: IDeleteRecord | null;
  sort_by: string;
  search_term: string;
  stock_tab: ProductListStockTab;
  page: number;
  total: number;
};

const initialState: InitialState = {
  itemToDelete: null,
  sort_by: "",
  search_term: "",
  stock_tab: "all",
  page: 1,
  total: 0,
};

const dataSlice = createSlice({
  name: "products/data",
  initialState,
  reducers: {
    setItemToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.itemToDelete = payload;
    },
    setSortBy: (state, { payload }: { payload: string }) => {
      state.sort_by = payload;
    },
    setTotal: (state, { payload }: { payload: number }) => {
      state.total = payload;
    },
    setSearchTerm: (state, { payload }: { payload: string }) => {
      state.search_term = payload;
    },
    setStockTab: (state, { payload }: { payload: ProductListStockTab }) => {
      state.stock_tab = payload;
    },
    setPage: (state, { payload }: { payload: number }) => {
      state.page = Math.max(1, payload);
    },
  },
});

export const {
  setItemToDelete,
  setSortBy,
  setTotal,
  setSearchTerm,
  setStockTab,
  setPage,
} = dataSlice.actions;
export default dataSlice.reducer;
