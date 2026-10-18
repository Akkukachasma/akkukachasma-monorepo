"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { SidebarHeaderWithTheme } from "./SidebarHeaderWithTheme";
import { useSidebarData } from "@/hooks/use-sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = useSidebarData();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-emerald-500/15 bg-gradient-to-b from-emerald-500/5 via-sidebar to-orange-500/5"
      {...props}
    >
      <SidebarHeader>
        <SidebarHeaderWithTheme brand={data.brand} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.menus} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
