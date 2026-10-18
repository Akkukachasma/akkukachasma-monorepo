"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSidebarData } from "@/hooks/use-sidebar-data";
import { NavUser } from "./nav-user";
import { AdminNotificationSheet } from "./AdminNotificationSheet";
import { cn } from "@/lib/utils";

export function AdminTopHeader({ className }: { className?: string }) {
  const { user } = useSidebarData();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4",
        "pt-[max(0px,env(safe-area-inset-top))]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1 size-10 touch-manipulation sm:size-8" />
        <Separator orientation="vertical" className="hidden h-4 sm:block" />
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <AdminNotificationSheet />
        <NavUser user={user} userType="manage" variant="header" />
      </div>
    </header>
  );
}
