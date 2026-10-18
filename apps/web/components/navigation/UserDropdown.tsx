"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLoggedInUser } from "@/features/auth";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  User,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { logout } from "@/features/auth/service";
import { cn } from "@/lib/utils";

function isAdminUser(roles: string[] | undefined) {
  return roles?.includes("admin") ?? false;
}

const UserDropdown = () => {
  const { data, isLoading } = useLoggedInUser();
  const isAdmin = isAdminUser(data?.roles);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Button variant="outline" size="icon" className="rounded-full" asChild>
        <Link href="/login" aria-label="Sign in">
          <User className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-full border-border/70 bg-background p-0 shadow-sm",
            "transition-[box-shadow,border-color] hover:border-border hover:shadow-md",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <Avatar className="h-full w-full rounded-full">
            <AvatarImage src={data.avatar?.url} alt="" />
            <AvatarFallback className="rounded-full text-sm font-medium">
              {data.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[min(100vw-1rem,18rem)] overflow-hidden rounded-xl border bg-popover p-0 shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        )}
      >
        <div className="border-b border-border/60 bg-gradient-to-br from-muted/80 to-muted/30 px-4 py-3.5">
          <div className="flex gap-3">
            <Avatar className="h-11 w-11 shrink-0 ring-2 ring-background shadow-sm">
              <AvatarImage src={data.avatar?.url} alt="" />
              <AvatarFallback className="text-sm font-semibold">
                {data.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {data.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {data.email}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-1.5">
          {isAdmin ? (
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link href="/manage" className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link href="/manage/orders" className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link
                  href="/manage/products"
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Products</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link
                  href="/manage/notifications"
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link
                  href="/manage/settings/account"
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Admin account</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          ) : (
            <DropdownMenuGroup className="space-y-0.5">
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link
                  href="/customers/account"
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-accent"
              >
                <Link
                  href="/customers/settings"
                  className="flex items-center gap-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <span className="font-medium">Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <div className="p-1.5 pt-0">
          <DropdownMenuItem
            onClick={() => void logout()}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
