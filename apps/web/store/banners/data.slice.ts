import { IDeleteRecord } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  itemToDelete: IDeleteRecord | null;
  sort_by: string;
  search_term: string;
  total: number;
};

const initialState: InitialState = {
  itemToDelete: null,
  sort_by: "",
  search_term: "",
  total: 0,
};

const dataSlice = createSlice({
  name: "banners/data",
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
  },
});

export const { setItemToDelete, setSortBy, setTotal, setSearchTerm } =
  dataSlice.actions;
export default dataSlice.reducer;
