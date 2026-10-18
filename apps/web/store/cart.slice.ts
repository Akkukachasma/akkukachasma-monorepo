import { IDeleteRecord } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  itemToDelete: IDeleteRecord<string> | null;
  search_term?: string;
  total: number;
  /** Incremented when quantity change starts, decremented when mutation settles. Used to disable checkout until estimation is updated. */
  quantityUpdatePendingCount: number;
};

const initialState: InitialState = {
  itemToDelete: null,
  search_term: "",
  total: 0,
  quantityUpdatePendingCount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setItemToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.itemToDelete = payload;
    },
    setTotal: (state, { payload }: { payload: number }) => {
      state.total = payload;
    },
    quantityUpdateStarted: (state) => {
      state.quantityUpdatePendingCount += 1;
    },
    quantityUpdateSettled: (state) => {
      state.quantityUpdatePendingCount = Math.max(
        0,
        state.quantityUpdatePendingCount - 1,
      );
    },
  },
});

export const {
  setItemToDelete,
  setTotal,
  quantityUpdateStarted,
  quantityUpdateSettled,
} = cartSlice.actions;
export default cartSlice.reducer;
