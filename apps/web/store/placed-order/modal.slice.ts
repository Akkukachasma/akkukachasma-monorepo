import { createSlice } from "@reduxjs/toolkit";

// Define the type for the initial state
type InitialState = {
    edit_modal: boolean;
    delete_modal:boolean;
};

// Define the initial state
const initialState: InitialState = {
    edit_modal: false,
    delete_modal:false,
};

// Create the modal slice
const modalSlice = createSlice({
    name: "placed-order/modal",
    initialState,
    reducers: {
        showEditPlaceOrder: (state, { payload }: { payload: boolean }) => {
            state.edit_modal = payload;  // Correct the payload typo
        },
        showDeletePlaceOrder:(state,{payload}:{payload:boolean})=>{
            state.delete_modal=payload;
        }
    }
});

// Export the actions
export const { showEditPlaceOrder,showDeletePlaceOrder } = modalSlice.actions;
// Export the reducer
export default modalSlice.reducer;
