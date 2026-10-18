import { ILensDetail } from "@/components/lens-details/LensDetail";
import { IDefaultUrl } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  lens_detail_id: string;
  modal: boolean;
  data: Partial<ILensDetail & IDefaultUrl> | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  lens_detail_id: "",
};

const lensDetailFormSlice = createSlice({
  name: "lens-details/form",
  initialState,
  reducers: {
    setData: (
      state,
      { payload }: { payload: Partial<ILensDetail & IDefaultUrl> | null },
    ) => {
      state.data = payload;
    },
    setLensDetailId: (state, { payload }: { payload: string }) => {
      state.lens_detail_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setLensDetailId, showModal, resetStore } =
  lensDetailFormSlice.actions;
export default lensDetailFormSlice.reducer;
