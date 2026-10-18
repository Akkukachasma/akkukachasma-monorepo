import React from "react";
import { IWrapper } from "@/lib/types";
import { AccountShell } from "@/features/customer/account/AccountShell";

/**
 * Customer account portal shell (/customers/*).
 * In-page AccountShell nav — separate from cart/checkout/wishlist.
 */
const CustomerPortalLayout: React.FC<IWrapper> = ({ children }) => {
  return (
    <div
      data-portal="customer"
      className="portal-shell flex h-full min-h-0 flex-1 flex-col"
    >
      <AccountShell>{children}</AccountShell>
    </div>
  );
};

export default CustomerPortalLayout;
