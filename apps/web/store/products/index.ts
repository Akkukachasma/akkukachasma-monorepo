import { combineReducers } from "@reduxjs/toolkit";
import dataStore from "./data.slice";
import formStore from "./form.slice";
import productColorStore from "./product-color.slice";

const prodcutStore = combineReducers({
  dataStore,
  formStore,
  productColorStore,
});

export default prodcutStore;
