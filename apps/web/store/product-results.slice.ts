import { createSlice } from "@reduxjs/toolkit";

export interface IProductResultFilters {
  color_ids?: string[];
  shape_ids?: string[];
  frame_width?: number[];
  lens_width?: number[];
  frame_size?: string[];
}

export interface ISearchParams {
  category_slug?: string;
  shape_slug?: string;
  gender?: string;
  search?: string;
}

type InitialState = {
  sort_by: string;
  search_term?: string;
  total: number;
  filters: IProductResultFilters;
  searchParams: ISearchParams;
};

const initialState: InitialState = {
  sort_by: "",
  search_term: "",
  total: 0,
  filters: {},
  searchParams: {},
};

const productResultSlice = createSlice({
  name: "product/result",
  initialState,
  reducers: {
    setSortBy: (state, { payload }: { payload: string }) => {
      state.sort_by = payload;
    },
    setTotal: (state, { payload }: { payload: number }) => {
      state.total = payload;
    },
    setFilters: (state, { payload }: { payload: IProductResultFilters }) => {
      state.filters = payload;
    },
    resetFilters: (state) => {
      state.filters = {};
    },
    setSearchParams: (state, { payload }: { payload: ISearchParams }) => {
      state.searchParams = payload;
    },
    resetSearchParams: (state) => {
      state.searchParams = {};
    },
  },
});

export const {
  setSortBy,
  setTotal,
  setFilters,
  resetFilters,
  setSearchParams,
  resetSearchParams,
} =
  productResultSlice.actions;
export default productResultSlice.reducer;
