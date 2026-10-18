"use client";

import { CUSTOMER_ROLE_CODES } from "@/lib/constants";
import useLoggedInUser from "../queries/useLoggedInUser";

/** True only when auth has resolved and the user has the customer role. */
export function useIsLoggedInCustomer(): boolean {
  const { data: user, isFetched, isError } = useLoggedInUser();

  if (!isFetched || isError || !user) {
    return false;
  }

  return (
    user.roles?.some((role) => CUSTOMER_ROLE_CODES.includes(role)) ?? false
  );
}
