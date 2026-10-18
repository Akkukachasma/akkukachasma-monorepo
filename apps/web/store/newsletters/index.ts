import { combineReducers } from "@reduxjs/toolkit";
import dataStore from "./data.slice";

const newsletterStore = combineReducers({
  dataStore,
});

export default newsletterStore;
