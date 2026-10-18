"use client";
import React from "react";
import ProductGlobalModals from "@/components/products/modals";
import { TaxDialog, ConfirmDeletion } from "@/features/admin/settings/tax";
import AddressModal from "./account/addresses/AddressModal";

const GlobalModals = () => {
  return (
    <React.Fragment>
      <ProductGlobalModals />
      <TaxDialog />
      <ConfirmDeletion />
      <AddressModal />
    </React.Fragment>
  );
};
export default GlobalModals;
