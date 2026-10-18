"use client";

import HeaderWrapper, {
  type HeaderWrapperProps,
} from "@/components/navigation/admin/HeaderWrapper";

/**
 * Customer userland page header: back + title.
 * No sidebar hamburger — storefront nav is SiteNavbar; account nav is AccountShell.
 */
export default function CustomerHeaderWrapper(props: HeaderWrapperProps) {
  return (
    <HeaderWrapper
      {...props}
      useCustomerChrome
      showSidebarTrigger={false}
    />
  );
}
