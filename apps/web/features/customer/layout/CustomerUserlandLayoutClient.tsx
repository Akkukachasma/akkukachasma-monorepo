"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/navigation/Footer";

type CustomerUserlandLayoutClientProps = {
  children: React.ReactNode;
};

function isAccountRoute(pathname: string | null) {
  return Boolean(pathname?.startsWith("/customers"));
}

/**
 * Customer userland chrome:
 * - `/customers/*` → SiteNavbar + content + Footer (AccountShell adds in-page nav)
 * - `/cart`, `/checkout`, `/wishlist` → full-width page-local chrome only (no storefront nav)
 */
export function CustomerUserlandLayoutClient({
  children,
}: CustomerUserlandLayoutClientProps) {
  const pathname = usePathname();
  const showStorefrontChrome = isAccountRoute(pathname);

  if (!showStorefrontChrome) {
    return (
      <div className="flex min-h-svh flex-col overflow-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <Navigation />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</div>
      <Footer />
    </div>
  );
}
