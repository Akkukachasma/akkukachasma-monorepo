"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger,
  useSidebarOptional,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export type HeaderBreadcrumb = {
  label: string;
  href?: string;
};

export interface HeaderWrapperProps {
  title?: string;
  tagline?: string;
  /** Explicit breadcrumb trail (manage toolbar). Falls back to title / onBackUrl. */
  breadcrumbs?: HeaderBreadcrumb[];
  children?: React.ReactNode;
  className?: string;
  onBackUrl?: string;
  /**
   * Customer page chrome (back + title + tagline). Independent of sidebar.
   * Prefer this over `showSidebarTrigger` for storefront userland titles.
   */
  useCustomerChrome?: boolean;
  /** When false, hides sidebar trigger. Only renders inside SidebarProvider. Manage default is false (global AdminTopHeader). */
  showSidebarTrigger?: boolean;
  /** Manage default: left. Customer userland uses `end`. */
  sidebarTriggerPlacement?: "start" | "end";
  /** Manage default: panel icon. Customer userland uses `menu` (hamburger). */
  sidebarTriggerVariant?: "panel" | "menu";
}

function labelFromPath(path: string): string {
  const seg = path.split("/").filter(Boolean).pop() ?? "";
  return seg
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveBreadcrumbs({
  breadcrumbs,
  title,
  onBackUrl,
}: {
  breadcrumbs?: HeaderBreadcrumb[];
  title?: string;
  onBackUrl?: string;
}): HeaderBreadcrumb[] {
  if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs;
  if (title && onBackUrl) {
    return [
      { label: labelFromPath(onBackUrl), href: onBackUrl },
      { label: title },
    ];
  }
  if (title) return [{ label: title }];
  return [];
}

function HeaderSidebarTrigger({
  variant,
  className,
}: {
  variant: "panel" | "menu";
  className?: string;
}) {
  const sidebar = useSidebarOptional();
  if (!sidebar) return null;

  if (variant === "menu") {
    return (
      <Button
        type="button"
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("size-10 shrink-0 touch-manipulation sm:size-9", className)}
        onClick={() => sidebar.toggleSidebar()}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
    );
  }

  return (
    <SidebarTrigger
      className={cn("-ml-1 size-10 touch-manipulation sm:size-8", className)}
    />
  );
}

function PageToolbarBreadcrumb({ items }: { items: HeaderBreadcrumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Manage secondary toolbar (default): sits in the page cell — no chrome background,
 * breadcrumb left, optional actions right.
 * Customer chrome: pass `useCustomerChrome` (via CustomerHeaderWrapper).
 */
const HeaderWrapper: React.FC<HeaderWrapperProps> = ({
  children,
  title,
  tagline,
  breadcrumbs,
  onBackUrl,
  className = "",
  useCustomerChrome = false,
  showSidebarTrigger = false,
  sidebarTriggerPlacement = "start",
  sidebarTriggerVariant = "panel",
}) => {
  const router = useRouter();
  const sidebar = useSidebarOptional();
  const showTrigger = showSidebarTrigger && sidebar !== null;
  const triggerAtStart = sidebarTriggerPlacement === "start";
  const crumbs = resolveBreadcrumbs({ breadcrumbs, title, onBackUrl });
  const customerChrome = useCustomerChrome || showSidebarTrigger;

  const handleBack = () => {
    if (onBackUrl) {
      router.push(onBackUrl);
    } else {
      router.back();
    }
  };

  const sidebarTrigger = showTrigger ? (
    <HeaderSidebarTrigger variant={sidebarTriggerVariant} />
  ) : null;

  // Customer / chrome header (back + title + optional menu trigger)
  if (customerChrome) {
    return (
      <header
        className={cn(
          "flex min-h-16 flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2 sm:px-6 shrink-0 border-b border-border bg-background pt-[max(0px,env(safe-area-inset-top))] transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:min-h-12",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {triggerAtStart && sidebarTrigger ? (
            <>
              {sidebarTrigger}
              <Separator
                orientation="vertical"
                className="mr-2 hidden h-4 sm:block"
              />
            </>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 touch-manipulation sm:size-8"
            onClick={() => handleBack()}
            aria-label="Go back"
          >
            <ChevronLeft className="size-5 sm:size-4" />
          </Button>
          <Separator
            orientation="vertical"
            className="mr-2 hidden h-4 sm:block"
          />
          <div className="min-w-0 flex-1">
            {title ? (
              <span className="block truncate font-semibold text-foreground sm:font-medium">
                {title}
              </span>
            ) : null}
            {tagline ? (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:text-sm">
                {tagline}
              </span>
            ) : null}
          </div>
        </div>
        {(children || (!triggerAtStart && sidebarTrigger)) && (
          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
            {children}
            {!triggerAtStart && sidebarTrigger ? (
              <>
                {children ? (
                  <Separator
                    orientation="vertical"
                    className="hidden h-4 sm:block"
                  />
                ) : null}
                {sidebarTrigger}
              </>
            ) : null}
          </div>
        )}
      </header>
    );
  }

  // Manage secondary page toolbar — in the page cell, no background chrome
  const hasActions = Boolean(children);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-4 pb-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <PageToolbarBreadcrumb items={crumbs} />
      </div>
      {hasActions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default HeaderWrapper;
