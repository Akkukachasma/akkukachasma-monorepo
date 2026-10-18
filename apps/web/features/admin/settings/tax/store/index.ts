import { combineReducers } from "@reduxjs/toolkit";
import ui from "./ui.slice";
const taxStore = combineReducers({
  ui,
});
export default taxStore;
