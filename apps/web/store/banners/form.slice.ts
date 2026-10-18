import { IBanner } from "@/components/banners/ListItem";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  item_id: string; // used to edit the item.
  modal: boolean;
  data: Partial<IBanner> | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  item_id: "",
};

const formSlice = createSlice({
  name: "banners/form",
  initialState,
  reducers: {
    setData: (state, { payload }: { payload: Partial<IBanner> | null }) => {
      state.data = payload;
    },
    setItemId: (state, { payload }: { payload: string }) => {
      state.item_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setItemId, showModal, resetStore } = formSlice.actions;
export default formSlice.reducer;
