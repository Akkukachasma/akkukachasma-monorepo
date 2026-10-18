import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  total: number;
  blockedTotal: number;
}

const initialState: UsersState = {
  total: 0,
  blockedTotal: 0,
};

const usersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    },
    setBlockedTotal(state, action: PayloadAction<number>) {
      state.blockedTotal = action.payload;
    },
  },
});

export const { setTotal, setBlockedTotal } = usersSlice.actions;
export default usersSlice.reducer;
