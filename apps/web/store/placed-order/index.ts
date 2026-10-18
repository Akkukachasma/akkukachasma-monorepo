import { combineReducers } from "@reduxjs/toolkit";
import modalStore from './modal.slice';



const placeOrderStore = combineReducers({
    modalStore,
});

export default placeOrderStore;