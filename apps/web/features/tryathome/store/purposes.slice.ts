import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TryAtHomePurpose {
  id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

interface PurposesModalState {
  modal: boolean;
  purposeToEdit: TryAtHomePurpose | null;
  purposeToDelete: TryAtHomePurpose | null;
}

interface PurposesState {
  modal: PurposesModalState;
}

const initialState: PurposesState = {
  modal: {
    modal: false,
    purposeToEdit: null,
    purposeToDelete: null,
  },
};

const purposesSlice = createSlice({
  name: "tryathomePurposes",
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<boolean>) => {
      state.modal.modal = action.payload;
      if (!action.payload) {
        state.modal.purposeToEdit = null;
      }
    },
    setPurposeToEdit: (
      state,
      action: PayloadAction<TryAtHomePurpose | null>,
    ) => {
      state.modal.purposeToEdit = action.payload;
      if (action.payload) {
        state.modal.modal = true;
      }
    },
    setPurposeToDelete: (
      state,
      action: PayloadAction<TryAtHomePurpose | null>,
    ) => {
      state.modal.purposeToDelete = action.payload;
    },
  },
});

export const { showModal, setPurposeToEdit, setPurposeToDelete } =
  purposesSlice.actions;
export default purposesSlice.reducer;
