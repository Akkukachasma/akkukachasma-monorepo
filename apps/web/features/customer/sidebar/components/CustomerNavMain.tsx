"use client";

import Link from "next/link";
import { Fragment } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

interface CustomerNavMainProps {
  sections: MenuItem[][];
}

export function CustomerNavMain({ sections }: CustomerNavMainProps) {
  return (
    <SidebarGroup>
      {sections.map((section, sectionIndex) => (
        <Fragment key={sectionIndex}>
          {sectionIndex > 0 ? (
            <SidebarSeparator className="my-2 group-data-[collapsible=icon]:mx-0" />
          ) : null}
          <SidebarMenu>
            {section.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={cn(
                    "touch-manipulation",
                    item.isActive &&
                      "bg-emerald-500/15 font-medium text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-200",
                  )}
                >
                  <Link href={item.url}>
                    {item.icon ? (
                      <item.icon
                        className={cn(
                          item.isActive && "text-emerald-600 dark:text-emerald-400",
                        )}
                      />
                    ) : null}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </Fragment>
      ))}
    </SidebarGroup>
  );
}
