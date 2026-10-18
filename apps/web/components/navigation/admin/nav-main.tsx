"use client";
import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/lib/types";
import Link from "next/link";
interface NavMainProps {
  items: MenuItem[];
}
export const NavMain: React.FC<NavMainProps> = ({ items }) => {
  const router = useRouter();

  const handleUrlRedirect = (url: string) => {
    router.push(url);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "touch-manipulation",
                        item.isActive &&
                          "bg-emerald-500/15 font-medium text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-200",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn(
                            item.isActive &&
                              "text-emerald-600 dark:text-emerald-400",
                          )}
                          onClick={() => handleUrlRedirect(item.url || "#")}
                        />
                      )}
                      <span onClick={() => handleUrlRedirect(item.url || "#")}>
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subItem.url}
                              className={cn(
                                "touch-manipulation",
                                subItem.isActive &&
                                  "bg-emerald-500/15 font-medium text-emerald-800 dark:text-emerald-200",
                              )}
                            >
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(
                  "touch-manipulation",
                  item.isActive &&
                    "bg-emerald-500/15 font-medium text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-200",
                )}
              >
                <Link href={item?.url || "#"}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
