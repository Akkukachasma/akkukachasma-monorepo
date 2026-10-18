import { IPowerType } from "@/components/power-types/PowerType";
import { IDefaultUrl } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
  power_type_id: string;
  modal: boolean;
  data: Partial<IPowerType & IDefaultUrl> | null;
};

const initialState: InitialState = {
  data: null,
  modal: false,
  power_type_id: "",
};

const powerTypeFormSlice = createSlice({
  name: "power-types/form",
  initialState,
  reducers: {
    setData: (
      state,
      { payload }: { payload: Partial<IPowerType & IDefaultUrl> },
    ) => {
      state.data = payload;
    },
    setPowerTypeId: (state, { payload }: { payload: string }) => {
      state.power_type_id = payload;
    },
    showModal: (state, { payload }: { payload: boolean }) => {
      state.modal = payload;
    },
    resetStore: () => {
      return initialState;
    },
  },
});

export const { setData, setPowerTypeId, showModal, resetStore } =
  powerTypeFormSlice.actions;
export default powerTypeFormSlice.reducer;
