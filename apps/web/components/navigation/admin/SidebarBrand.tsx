"use client";
import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ISidebarBrand } from "@/lib/types";

interface SidebarBrandProps {
  brand: ISidebarBrand;
}

const SidebarBrand: React.FC<SidebarBrandProps> = ({ brand }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent-foreground data-[state=open]:text-sidebar-accent"
          asChild
        >
          <a href={brand?.website?.url || "#"}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <brand.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{brand.name}</span>
              {brand.website && (
                <span className="truncate text-xs">{brand.website.label}</span>
              )}
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
export default SidebarBrand;
