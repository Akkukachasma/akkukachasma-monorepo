import { IProduct } from "@/components/products/ListItem";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  item_id: string; // used to edit the item.
  modal: boolean;
  editModal: boolean;
  data: Partial<IProduct> | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  editModal: false,
  item_id: "",
};

const formSlice = createSlice({
  name: "products/form",
  initialState,
  reducers: {
    setData: (state, { payload }: { payload: Partial<IProduct> | null }) => {
      state.data = payload;
    },
    setItemId: (state, { payload }: { payload: string }) => {
      state.item_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    editModal: (state, { payload }: { payload: boolean }) => {
      state.editModal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setItemId, showModal, editModal, resetStore } =
  formSlice.actions;
export default formSlice.reducer;
