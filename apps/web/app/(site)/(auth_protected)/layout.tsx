import React from "react";
import { IWrapper } from "@/lib/types";
import { protect } from "@/lib/server";

/**
 * Layout for authenticated customer routes.
 * Only runs protect(); child route groups add their own layout (sidebar or minimal).
 */
const AuthProtectionLayout: React.FC<IWrapper> = async ({ children }) => {
  await protect();
  return <>{children}</>;
};
export default AuthProtectionLayout;
