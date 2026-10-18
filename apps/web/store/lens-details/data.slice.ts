import { IDeleteRecord, ISearchTerm } from "@/lib/types";
import { generateQueryString } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  lensDetailToDelete: IDeleteRecord | null;
  sort_by: string;
  search_term: ISearchTerm;
  total: number;
};

const initialState: InitialState = {
  lensDetailToDelete: null,
  sort_by: "",
  search_term: {
    query_string: "",
    query: "",
  },
  total: 0,
};

const lensDetailSlice = createSlice({
  name: "lens-details/data",
  initialState,
  reducers: {
    setLensDetailToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.lensDetailToDelete = payload;
    },
    setSortBy: (state, { payload }: { payload: string }) => {
      state.sort_by = payload;
    },
    setTotal: (state, { payload }: { payload: number }) => {
      state.total = payload;
    },
    setSearchTerm: (state, { payload }: { payload: string }) => {
      state.search_term.query = payload;
    },
    buildQueryString: (state, { payload }: { payload: string }) => {
      state.search_term.query_string = payload;
    },
  },
});

export const {
  setLensDetailToDelete,
  setSortBy,
  setTotal,
  setSearchTerm,
  buildQueryString,
} = lensDetailSlice.actions;
export default lensDetailSlice.reducer;
