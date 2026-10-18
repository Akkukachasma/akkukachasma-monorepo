import { IDeleteRecord, IProductColor } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  modal: boolean;
  data: Partial<IProductColor> | null;
  itemToDelete: IDeleteRecord | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  itemToDelete: null,
};

const productColorSlice = createSlice({
  name: "product-color",
  initialState,
  reducers: {
    setData: (
      state,
      { payload }: { payload: Partial<IProductColor> | null },
    ) => {
      state.data = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    setItemToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.itemToDelete = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, showModal, resetStore, setItemToDelete } =
  productColorSlice.actions;
export default productColorSlice.reducer;
