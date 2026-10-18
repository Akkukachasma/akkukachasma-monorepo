import { IFormOption } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
    showForm: boolean,
    dataToEdit: IFormOption | null,
}

const initialState: InitialState = {
    showForm: false,
    dataToEdit: null
}
const typeSlice = createSlice({
    name: "types",
    initialState,
    reducers: {
        setShowForm: (state, { payload }: { payload: boolean }) => {
            state.showForm = payload;
        },
        setDataToEdit: (state, { payload }: { payload: IFormOption | null }) => {
            state.dataToEdit = payload;
        }
    }
});

export const { setDataToEdit, setShowForm } = typeSlice.actions;
export default typeSlice.reducer;