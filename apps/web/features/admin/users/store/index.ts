import { combineReducers } from "@reduxjs/toolkit";
import data from "./users.slice";

const adminUsersStore = combineReducers({
  data,
});

export default adminUsersStore;
