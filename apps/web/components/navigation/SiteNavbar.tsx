"use client";

import Link from "next/link";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";
import RenderCart from "./RenderCart";
import FreeSearch from "./FreeSearch";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarOptional } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { useIsLoggedInCustomer } from "@/features/auth/hooks/useIsLoggedInCustomer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { storefrontNavLinks } from "@/features/customer/sidebar";
import GuestMobileMenuSheet from "./GuestMobileMenuSheet";

const linkClass =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap";

const SiteNavbar = () => {
  const isMobile = useIsMobile();
  const sidebar = useSidebarOptional();
  const isCustomer = useIsLoggedInCustomer();

  const useCustomerSidebarMenu =
    isMobile && isCustomer && sidebar !== null;

  const openCustomerMenu = () => sidebar?.toggleSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="app-container flex h-[4.5rem] items-center justify-between gap-3 md:h-20 md:gap-8">
        <Logo className="min-w-0 shrink md:shrink-0" />

        <nav
          className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8"
          aria-label="Main"
        >
          {storefrontNavLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <FreeSearch />
          <RenderCart />
          <UserDropdown />
        </div>

        <div className="flex md:hidden flex-shrink-0 items-center gap-1">
          <FreeSearch />
          <Button size="icon" variant="ghost" className="shrink-0" asChild>
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>
          <RenderCart className="shrink-0" isMobile />
          {useCustomerSidebarMenu ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label="Open menu"
              onClick={openCustomerMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          ) : (
            <GuestMobileMenuSheet />
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteNavbar;
