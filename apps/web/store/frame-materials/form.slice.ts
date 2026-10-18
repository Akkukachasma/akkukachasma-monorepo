
import { IFrameMaterial } from "@/components/frame-materials/FrameMaterial";
import { IDefaultUrl } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  frame_material_id: string;
  modal: boolean;
  data: Partial<IFrameMaterial > | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  frame_material_id: "",
};

const framematerialsFormSlice = createSlice({
  name: "frame-materials/form",
  initialState,
  reducers: {
    setData: (
      state,
      { payload }: { payload: Partial<IFrameMaterial> | null },
    ) => {
      state.data = payload;
    },
    setFrameMaterialsId: (state, { payload }: { payload: string }) => {
      state.frame_material_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setFrameMaterialsId, showModal, resetStore } =
framematerialsFormSlice.actions;
export default framematerialsFormSlice.reducer;
