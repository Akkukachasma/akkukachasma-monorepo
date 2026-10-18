import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IAddress } from "@/components/account/addresses/Address";

type InitialState = {
  addressModal: boolean;
  editingAddress: IAddress | null;
};

const initialState: InitialState = {
  addressModal: false,
  editingAddress: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAddressModal: (state, { payload }: PayloadAction<boolean>) => {
      state.addressModal = payload;
      if (!payload) {
        state.editingAddress = null;
      }
    },
    openCreateAddressModal: (state) => {
      state.editingAddress = null;
      state.addressModal = true;
    },
    openEditAddressModal: (
      state,
      { payload }: PayloadAction<IAddress>,
    ) => {
      state.editingAddress = payload;
      state.addressModal = true;
    },
  },
});

export const {
  setAddressModal,
  openCreateAddressModal,
  openEditAddressModal,
} = accountSlice.actions;
export default accountSlice.reducer;
