"use client";

import React from "react";
import { useCheckoutData } from "../hooks/useCheckoutData";

type CheckoutContextValue = ReturnType<typeof useCheckoutData>;

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const value = useCheckoutData();
  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return ctx;
}
