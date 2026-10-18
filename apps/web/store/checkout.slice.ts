import { IDeleteRecord } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  itemToDelete: IDeleteRecord<{ id: string }> | null;
};

const initialState: InitialState = {
  itemToDelete: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setItemToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.itemToDelete = payload;
    },
  },
});

export const { setItemToDelete } = checkoutSlice.actions;
export default checkoutSlice.reducer;
