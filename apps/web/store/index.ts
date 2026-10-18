import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import userStore from "./slices/users.slice";
import typeStore from "./slices/types.slice";
import powerTypeStore from "./power-types";
import placeOrderStore from "./placed-order";
import productStore from "./products";
import lensFeatureStore from "./lens-features";
import lensDetailStore from "./lens-details";
import frameMaterialStore from "./frame-materials";
import brandStore from "./brands";
import colorStore from "./colors";
import shapeStore from "./shapes";
import couponStore from "./coupon-manager";
import categoryStore from "./categories";
import articleStore from "./articles";
import newsletterStore from "./newsletters";
import bannerStore from "./banners";
import productResultStore from "./product-results.slice";
import cartStore from "./cart.slice";
import globalStore from "./global.slice";
import { invoiceTaxStore } from "@/features/admin/settings/tax";
import accountStore from "./account.slice";
import checkoutStore from "./checkout.slice";
import { adminUsersStore } from "@/features/admin/users";
import franchiseRequestStore from "@/features/franchise-request/store";
import { tryathomeStore } from "@/features/tryathome/store";
import ordersStore from "@/features/admin/orders/store";

const store = configureStore({
  reducer: {
    userStore,
    typeStore,
    lensFeatureStore,
    lensDetailStore,
    powerTypeStore,
    placeOrderStore,
    productStore,
    frameMaterialStore,
    brandStore,
    colorStore,
    shapeStore,
    categoryStore,
    couponStore,
    newsletterStore,
    articleStore,
    bannerStore,
    productResultStore,
    cartStore,
    globalStore,
    invoiceTaxStore,
    accountStore,
    checkoutStore,
    adminUsersStore,
    franchiseRequestStore,
    ordersStore,
    ...tryathomeStore,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
