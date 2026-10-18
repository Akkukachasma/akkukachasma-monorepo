"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { CustomerNavMain } from "./CustomerNavMain";
import { SidebarHeaderWithTheme } from "@/components/navigation/admin/SidebarHeaderWithTheme";
import { NavUser } from "@/components/navigation/admin/nav-user";
import { useCustomerSidebarData } from "../hooks/use-customer-sidebar-data";
import { cn } from "@/lib/utils";

export function CustomerSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const data = useCustomerSidebarData();
  const pathname = usePathname();
  const isAccountPortal = pathname?.startsWith("/customers") ?? false;

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        isAccountPortal &&
          "border-r border-emerald-500/15 bg-gradient-to-b from-emerald-500/5 via-sidebar to-orange-500/5",
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarHeaderWithTheme brand={data.brand} />
      </SidebarHeader>
      <SidebarContent>
        <CustomerNavMain sections={data.sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} userType="customer" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
