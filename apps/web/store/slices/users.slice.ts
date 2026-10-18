import { createSlice } from "@reduxjs/toolkit";

type FilterTypes = "all" | "pending_account_verification" | "pending_account_setup" | "pending_email_verification";

type InitialState = {
    filter: FilterTypes
}

const initialState: InitialState = {
    filter: "all",
}

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setFilter: (state, { payload }: { payload: FilterTypes }) => {
            state.filter = payload;
        }
    }
});

export const { setFilter } = userSlice.actions;

export default userSlice.reducer;