"use client";

import * as React from "react";
import SidebarBrand from "./SidebarBrand";
import { ThemeModePopover } from "@/components/theme";
import type { ISidebarBrand } from "@/lib/types";

interface SidebarHeaderWithThemeProps {
  brand: ISidebarBrand;
}

export function SidebarHeaderWithTheme({ brand }: SidebarHeaderWithThemeProps) {
  return (
    <div className="flex items-start gap-1">
      <div className="min-w-0 flex-1 overflow-hidden">
        <SidebarBrand brand={brand} />
      </div>
      <ThemeModePopover className="mt-0.5 text-sidebar-foreground" />
    </div>
  );
}
