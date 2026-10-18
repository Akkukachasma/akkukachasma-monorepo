import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITax } from "../components/TaxCard";
import { IDeleteRecord } from "@/lib/types";
type InitialState = {
  dialog: boolean;
  data: ITax | null;
  itemToDelete: IDeleteRecord | null;
};
const initialState: InitialState = {
  dialog: false,
  data: null,
  itemToDelete: null,
};
const taxSlice = createSlice({
  name: "setting/tax",
  initialState,
  reducers: {
    setDialog: (state, action: PayloadAction<boolean>) => {
      state.dialog = action.payload;
    },
    setData: (state, action: PayloadAction<ITax | null>) => {
      state.data = action.payload;
    },
    setItemToDelete: (state, action: PayloadAction<IDeleteRecord | null>) => {
      state.itemToDelete = action.payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setDialog, setData, setItemToDelete, resetStore } =
  taxSlice.actions;
export default taxSlice.reducer;
