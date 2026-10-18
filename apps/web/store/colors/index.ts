import { combineReducers } from "@reduxjs/toolkit";
import dataStore from './data.slice';
import formStore from './form.slice';


const colorStore = combineReducers({
    dataStore,
    formStore,
});

export default colorStore;