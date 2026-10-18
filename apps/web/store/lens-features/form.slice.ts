
import { ILensFeature } from "@/components/lens-features/LensFeature";
import { IDefaultUrl } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  lens_feature_id: string;
  modal: boolean;
  data: Partial<ILensFeature & IDefaultUrl> | null;
};

const initialState: InitialState = {
  modal: false,
  data: null,
  lens_feature_id: "",
};

const LensFeatureFormSlice = createSlice({
  name: "lens-feature/form",
  initialState,
  reducers: {
    setData: (
      state,
      { payload }: { payload: Partial<ILensFeature & IDefaultUrl> },
    ) => {
      state.data = payload;
    },
    setLensFeatureId: (state, { payload }: { payload: string }) => {
      state.lens_feature_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setLensFeatureId, showModal, resetStore } =
  LensFeatureFormSlice.actions;
export default LensFeatureFormSlice.reducer;
