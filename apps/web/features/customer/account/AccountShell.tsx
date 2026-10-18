"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { customerAccountNav } from "@/features/customer/sidebar/data/sidebar-data";
import { cn } from "@/lib/utils";

type AccountShellProps = {
  children: React.ReactNode;
};

function isAccountNavActive(pathname: string | null, url: string) {
  if (!pathname) return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * In-page account navigation for `/customers/*` only.
 * Desktop: left rail. Mobile: horizontal scroll pills (settings-style).
 */
export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-container flex flex-1 flex-col gap-4 px-4 py-4 md:flex-row md:gap-8 md:py-6">
      <nav
        className="flex shrink-0 gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Account"
      >
        {customerAccountNav.map((item) => {
          const isActive = isAccountNavActive(pathname, item.url);
          return (
            <Button
              key={item.url}
              className="shrink-0 rounded-3xl animate-smooth hover:bg-foreground hover:text-background"
              variant={isActive ? "default" : "secondary"}
              asChild
            >
              <Link href={item.url}>{item.title}</Link>
            </Button>
          );
        })}
      </nav>

      <aside className="hidden w-52 shrink-0 lg:w-56 md:block">
        <nav
          className="sticky top-24 space-y-0.5"
          aria-label="Account"
        >
          {customerAccountNav.map((item) => {
            const Icon = item.icon;
            const isActive = isAccountNavActive(pathname, item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-card font-medium text-foreground"
                    : "font-normal text-muted-foreground hover:bg-card/70 hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
