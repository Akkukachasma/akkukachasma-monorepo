import { combineReducers } from "@reduxjs/toolkit";
import dataStore from "./data.slice";
import formStore from "./form.slice";
import bannerImageStore from "./banner-image.slice";

const bannerStore = combineReducers({
  dataStore,
  formStore,
  bannerImageStore,
});

export default bannerStore;
