"use client";

import { BadgeCheck, Bell, ChevronsUpDown, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarOptional,
} from "@/components/ui/sidebar";
import { IUser } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { logout } from "@/features/auth/service";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavUserType = "manage" | "customer";
type NavUserVariant = "sidebar" | "header";

function UserMenuContent({
  user,
  userType,
  showNotifications,
}: {
  user: IUser;
  userType: NavUserType;
  showNotifications: boolean;
}) {
  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar?.url} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href={
              userType === "customer"
                ? "/customers/account"
                : "/manage/settings/account"
            }
            className="flex"
          >
            <BadgeCheck className="mr-2 size-5" />
            Account
          </Link>
        </DropdownMenuItem>
        {showNotifications ? (
          <DropdownMenuItem asChild>
            <Link
              href={
                userType === "customer"
                  ? "/customers/notifications"
                  : "/manage/notifications"
              }
              className="flex"
            >
              <Bell className="mr-2 size-5" />
              Notifications
            </Link>
          </DropdownMenuItem>
        ) : null}
        {userType === "customer" ? (
          <DropdownMenuItem asChild>
            <Link href="/customers/settings" className="flex">
              <Settings className="mr-2 size-5" />
              Settings
            </Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <button type="button" onClick={() => logout()} className="w-full">
          <LogoutIcon className="mr-2 size-5" />
          Log out
        </button>
      </DropdownMenuItem>
    </>
  );
}

export function NavUser({
  user,
  userType = "manage",
  variant = "sidebar",
  className,
}: {
  user: IUser | null;
  userType?: NavUserType;
  variant?: NavUserVariant;
  className?: string;
}) {
  const sidebar = useSidebarOptional();
  const isMobile = sidebar?.isMobile ?? false;
  // Admin top header owns notifications via the bell; customer keeps the menu link.
  const showNotifications = userType === "customer";

  if (!user) {
    return null;
  }

  if (variant === "header") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-10 shrink-0 rounded-full touch-manipulation sm:size-9",
              className,
            )}
            aria-label="Open profile menu"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar?.url} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <UserMenuContent
            user={user}
            userType={userType}
            showNotifications={showNotifications}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar?.url} alt={user.name} />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <UserMenuContent
              user={user}
              userType={userType}
              showNotifications={showNotifications}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
