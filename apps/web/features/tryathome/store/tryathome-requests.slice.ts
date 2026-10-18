import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TryAtHomeRequestsDataState {
  total: number;
  search_term: string;
  sort_by: string;
  purpose_id: string;
  start_date: string;
  end_date: string;
}

interface TryAtHomeRequestsState {
  data: TryAtHomeRequestsDataState;
}

const initialState: TryAtHomeRequestsState = {
  data: {
    total: 0,
    search_term: "",
    sort_by: "created_desc",
    purpose_id: "",
    start_date: "",
    end_date: "",
  },
};

const tryAtHomeRequestsSlice = createSlice({
  name: "tryAtHomeRequests",
  initialState,
  reducers: {
    setTotal: (state, action: PayloadAction<number>) => {
      state.data.total = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.data.search_term = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.data.sort_by = action.payload;
    },
    setPurposeId: (state, action: PayloadAction<string>) => {
      state.data.purpose_id = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.data.start_date = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.data.end_date = action.payload;
    },
  },
});

export const {
  setTotal,
  setSearchTerm,
  setSortBy,
  setPurposeId,
  setStartDate,
  setEndDate,
} = tryAtHomeRequestsSlice.actions;
export default tryAtHomeRequestsSlice.reducer;
