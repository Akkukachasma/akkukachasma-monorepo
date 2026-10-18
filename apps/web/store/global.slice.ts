import { createSlice } from "@reduxjs/toolkit";

interface GlobalBooleanStates {
  sidemenu: boolean;
  shouldCheckOut: boolean;
}

interface InitialState extends GlobalBooleanStates {}

const initialState: InitialState = {
  sidemenu: false,
  shouldCheckOut: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setBooleanState: (
      state,
      { payload }: { payload: { name: keyof InitialState; value: boolean } },
    ) => {
      state[payload.name] = payload.value;
    },
  },
});

export const { setBooleanState } = globalSlice.actions;
export default globalSlice.reducer;
