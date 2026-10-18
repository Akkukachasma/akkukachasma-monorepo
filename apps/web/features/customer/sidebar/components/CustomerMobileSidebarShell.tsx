"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useIsLoggedInCustomer } from "@/features/auth/hooks/useIsLoggedInCustomer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { CustomerSidebar } from "./CustomerSidebar";

type CustomerMobileSidebarShellProps = {
  children: React.ReactNode;
};

/**
 * Mobile-only overlay sidebar for logged-in customers on public/marketing routes.
 * Isolated SidebarProvider — does not affect /manage.
 */
export function CustomerMobileSidebarShell({
  children,
}: CustomerMobileSidebarShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isCustomer = useIsLoggedInCustomer();

  const shouldMount =
    isMobile && isCustomer && !pathname.startsWith("/manage");

  if (!shouldMount) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <CustomerSidebar />
      <SidebarInset className="min-h-svh w-full min-w-0 flex-1">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
