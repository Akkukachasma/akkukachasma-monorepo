import { IBannerImage } from "@/components/banners/ListItem";
import { IDeleteRecord } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  modal: boolean;
  data: Partial<IBannerImage> | null;
  itemToDelete: IDeleteRecord | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  itemToDelete: null,
};

const bannerImageSlice = createSlice({
  name: "banner-image/form",
  initialState,
  reducers: {
    setItemToDelete: (
      state,
      { payload }: { payload: IDeleteRecord | null },
    ) => {
      state.itemToDelete = payload;
    },
    setData: (
      state,
      { payload }: { payload: Partial<IBannerImage> | null },
    ) => {
      state.data = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, showModal, resetStore, setItemToDelete } =
  bannerImageSlice.actions;
export default bannerImageSlice.reducer;
