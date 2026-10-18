import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { TOKENS } from "./constants";
import {
  MANAGE_BASE,
  MANAGE_ROLE_CODES,
  CUSTOMER_ROLE_CODES,
  CUSTOMER_PATH_PREFIXES,
  GUEST_ALLOWED_PREFIXES,
} from "./constants";
import { getDetails } from "@/features/auth/service";

export const checkToken = async (
  name?: string
): Promise<string | undefined> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(name || TOKENS.AUTH_TOKEN)?.value;
  return token;
};

export function isManagePath(path: string | null): boolean {
  return path === MANAGE_BASE || (path?.startsWith(`${MANAGE_BASE}/`) ?? false);
}

export function isCustomerPath(path: string | null): boolean {
  if (!path) return false;
  return CUSTOMER_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export const whichUserLand = async () => {
  const token = await checkToken();
  const details = await getDetails(token);
  const userRoles = details?.data?.user_roles ?? [];
  const isCustomer = userRoles.some(
    (ur) =>
      CUSTOMER_ROLE_CODES.includes(ur.role.code) &&
      ur.role.is_active &&
      ur.role.is_system_role
  );
  const isOperator = userRoles.some(
    (ur) =>
      MANAGE_ROLE_CODES.includes(ur.role.code) &&
      ur.role.is_active &&
      ur.role.is_system_role
  );
  return { isCustomer, isOperator };
};

export const protect = async () => {
  const headerList = await headers();
  const currentUrl = headerList.get("x-current-path");
  const { isCustomer, isOperator } = await whichUserLand();
  const isLoggedIn = isCustomer || isOperator;

  const encodedCurrentUrl = encodeURIComponent(currentUrl || "");
  const redirectUrl = `/login?from=${encodedCurrentUrl}`;

  const isManage = isManagePath(currentUrl);
  const isCustPath = isCustomerPath(currentUrl);

  if (isManage) {
    if (!isLoggedIn || !isOperator) {
      const fromParam =
        isLoggedIn && isCustomer ? "/customers/account" : currentUrl || "/";
      redirect(`/login?from=${encodeURIComponent(fromParam)}`);
    }
  } else if (isCustPath) {
    const isGuestAllowed = GUEST_ALLOWED_PREFIXES.some(
      (prefix) =>
        currentUrl === prefix || currentUrl?.startsWith(`${prefix}/`)
    );
    if (!isLoggedIn) {
      if (isGuestAllowed) {
        // Allow guest access to cart/checkout
      } else {
        redirect(redirectUrl);
      }
    }
    if (isOperator && !isCustomer) {
      notFound();
    }
  }
};

export const redirectToUserLand = async () => {
  const { isCustomer, isOperator } = await whichUserLand();
  if (isOperator) {
    redirect("/manage");
  }
  if (isCustomer) {
    redirect("/customers/account");
  }
  if (await checkToken()) {
    notFound();
  }
  redirect("/login");
};

export const isMobileDevice = async () => {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  return userAgent?.includes("Mobile") || userAgent?.includes("Android") || userAgent?.includes("iPhone") || userAgent?.includes("iPad") || userAgent?.includes("iPod");
}