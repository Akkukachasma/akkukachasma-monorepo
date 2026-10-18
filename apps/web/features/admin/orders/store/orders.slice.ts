import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrdersState {
  total: number;
  search_term: string;
  sort_by: string;
  status: string;
  payment_status: string;
  payment_mode: string;
  start_date: string;
  end_date: string;
}

const initialState: OrdersState = {
  total: 0,
  search_term: "",
  sort_by: "created_desc",
  status: "",
  payment_status: "",
  payment_mode: "",
  start_date: "",
  end_date: "",
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.search_term = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sort_by = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<string>) => {
      state.payment_status = action.payload;
    },
    setPaymentMode: (state, action: PayloadAction<string>) => {
      state.payment_mode = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.start_date = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.end_date = action.payload;
    },
  },
});

export const {
  setTotal,
  setSearchTerm,
  setSortBy,
  setStatus,
  setPaymentStatus,
  setPaymentMode,
  setStartDate,
  setEndDate,
} = ordersSlice.actions;

export default ordersSlice.reducer;
