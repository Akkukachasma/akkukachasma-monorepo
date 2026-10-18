"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MobileThemePicker from "./MobileThemePicker";
import { useIsLoggedInCustomer } from "@/features/auth/hooks/useIsLoggedInCustomer";

/** Storefront links — not the logged-in admin-like customer sidebar. */
const guestMobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/try-at-home", label: "Try@Home" },
  { href: "/franchise-enquiry", label: "Franchise" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
  { href: "/about-us", label: "About" },
  { href: "/track-order", label: "Track order" },
] as const;

const customerQuickLinks = [
  { href: "/customers/account", label: "Account" },
  { href: "/customers/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
] as const;

const sheetLinkClass =
  "flex w-full items-center rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted/80";

function GuestMobileMenuLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link href={href} className={sheetLinkClass} onClick={onNavigate}>
      {label}
    </Link>
  );
}

/**
 * Mobile storefront menu when CustomerSidebar is not mounted
 * (guests, or logged-in customers on cart/checkout/wishlist/account).
 */
export default function GuestMobileMenuSheet() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isCustomer = useIsLoggedInCustomer();

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      {menuOpen ? (
        <SheetContent
          allowPointerDismissal
          side="left"
          showCloseIcon
          className="flex h-full w-[min(100vw-3rem,20rem)] flex-col p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-1 flex-col overflow-hidden px-6 pb-2 pt-6">
            <SheetHeader className="text-left border-b pb-4">
              <SheetTitle className="flex flex-wrap items-center gap-2">
                <span className="sr-only">Menu</span>
                <div className="grid size-8 place-content-center rounded-full bg-muted">
                  <User className="size-5" />
                </div>
                {isCustomer ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/customers/account" onClick={closeMenu}>
                      My Account
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login" onClick={closeMenu}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/signup" onClick={closeMenu}>
                        Create Account
                      </Link>
                    </Button>
                  </>
                )}
              </SheetTitle>
            </SheetHeader>
            <nav
              className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
              aria-label="Storefront"
            >
              {isCustomer
                ? customerQuickLinks.map(({ href, label }) => (
                    <GuestMobileMenuLink
                      key={href}
                      href={href}
                      label={label}
                      onNavigate={closeMenu}
                    />
                  ))
                : null}
              {guestMobileNavLinks.map(({ href, label }) => (
                <GuestMobileMenuLink
                  key={href}
                  href={href}
                  label={label}
                  onNavigate={closeMenu}
                />
              ))}
            </nav>
          </div>
          <div className="mt-auto shrink-0 border-t border-border px-6 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Appearance
            </p>
            <MobileThemePicker />
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
