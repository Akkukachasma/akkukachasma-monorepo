import { IDeleteRecord, ISearchTerm } from "@/lib/types";
import { generateQueryString } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  frameMaterialToDelete: IDeleteRecord | null;
  sort_by: string;
  search_term: ISearchTerm;
  total: number;
};

const initialState: InitialState = {
  frameMaterialToDelete: null,
  sort_by: "",
  search_term: {
    query_string: "",
    query: "",
  },
  total: 0,
};

const framematerialsFormSlice = createSlice({
  name: "frame-materials/data",
  initialState,
  reducers: {
    setFrameMaterialToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.frameMaterialToDelete = payload;
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
  setFrameMaterialToDelete,
  setSortBy,
  setTotal,
  setSearchTerm,
  buildQueryString,
} = framematerialsFormSlice.actions;
export default framematerialsFormSlice.reducer;
