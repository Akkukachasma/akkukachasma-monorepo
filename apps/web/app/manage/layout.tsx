import React from "react";
import { IWrapper } from "@/lib/types";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/admin/Sidebar";
import { AdminTopHeader } from "@/components/navigation/admin/AdminTopHeader";
import { protect } from "@/lib/server";

/**
 * Manage area layout for admins and staff. Protects all /manage/* routes:
 * - Unauthenticated or non-admin/non-staff users are redirected to /login with ?from= current path.
 * - Authenticated admin/staff see the sidebar, global top header, and child content.
 */
const RootLayout: React.FC<IWrapper> = async ({ children }) => {
  await protect();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset data-portal="admin" className="portal-shell overflow-auto">
        <AdminTopHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
export default RootLayout;
