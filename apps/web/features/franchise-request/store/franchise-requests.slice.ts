import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FranchiseRequestsDataState {
  total: number;
  page: number;
  search_term: string;
  sort_by: string;
  email: string;
  phone_number: string;
  start_date: string;
  end_date: string;
}

const initialState: FranchiseRequestsDataState = {
  total: 0,
  page: 1,
  search_term: "",
  sort_by: "created_desc",
  email: "",
  phone_number: "",
  start_date: "",
  end_date: "",
};

const franchiseRequestsSlice = createSlice({
  name: "franchiseRequests",
  initialState,
  reducers: {
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.search_term = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sort_by = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phone_number = action.payload;
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
  setPage,
  setSearchTerm,
  setSortBy,
  setEmail,
  setPhoneNumber,
  setStartDate,
  setEndDate,
} = franchiseRequestsSlice.actions;
export default franchiseRequestsSlice.reducer;
