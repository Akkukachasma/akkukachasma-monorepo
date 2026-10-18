import { IDeleteRecord } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  powerTypeToDelete: IDeleteRecord | null;
  sort_by: string;
  search_term?: string;
  total: number;
};

const initialState: InitialState = {
  powerTypeToDelete: null,
  sort_by: "",
  search_term: "",
  total: 0,
};

const powerTypeSlice = createSlice({
  name: "customer/data",
  initialState,
  reducers: {
    setPowerTypeToDelete: (state, { payload }: { payload: IDeleteRecord | null }) => {
      state.powerTypeToDelete = payload;
    },
    setSortBy: (state, { payload }: { payload: string }) => {
      state.sort_by = payload;
    },
    setTotal: (state, { payload }: { payload: number }) => {
      state.total = payload;
    },
  },
});

export const { setPowerTypeToDelete, setSortBy, setTotal } = powerTypeSlice.actions;
export default powerTypeSlice.reducer;