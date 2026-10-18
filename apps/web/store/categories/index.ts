import { combineReducers } from "@reduxjs/toolkit";
import dataStore from './data.slice';
import formStore from './form.slice';


const categoryStore = combineReducers({
    dataStore,
    formStore,
});

export default categoryStore;