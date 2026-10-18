import { combineReducers } from "@reduxjs/toolkit";
import ordersSlice from "./orders.slice";

const ordersStore = combineReducers({
  data: ordersSlice,
});

export default ordersStore;
