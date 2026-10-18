import React from "react";
import { IWrapper } from "@/lib/types";
import { CustomerUserlandLayoutClient } from "@/features/customer/layout/CustomerUserlandLayoutClient";

/**
 * Unified layout for customer userland: /customers/*, /cart, /checkout, /wishlist.
 * Storefront topbar only on /customers/*; shopping flows use page-local chrome.
 */
const CustomerUserlandLayout: React.FC<IWrapper> = ({ children }) => {
  return <CustomerUserlandLayoutClient>{children}</CustomerUserlandLayoutClient>;
};

export default CustomerUserlandLayout;
