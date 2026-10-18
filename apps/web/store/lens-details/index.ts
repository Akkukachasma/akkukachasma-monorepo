import { combineReducers } from "@reduxjs/toolkit";
import dataStore from './data.slice';
import formStore from './form.slice';


const lensDetailStore = combineReducers({
    dataStore,
    formStore,
});

export default lensDetailStore;