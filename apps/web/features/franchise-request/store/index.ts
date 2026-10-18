import { combineReducers } from "@reduxjs/toolkit";
import data from "./franchise-requests.slice";

const franchiseRequestStore = combineReducers({
  data,
});

export default franchiseRequestStore;
