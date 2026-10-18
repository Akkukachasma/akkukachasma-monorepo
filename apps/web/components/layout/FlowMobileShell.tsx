"use client";

import MobileNavbar from "@/components/navigation/mobile-navbar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Immersive mobile chrome for transactional flows (cart, checkout, wishlist).
 * Pairs with server-side `isMobileDevice()` the same way as product PDP:
 * branch mobile → FlowMobileShell + content; desktop → Navigation/Footer or HeaderWrapper.
 *
 * Uses iOS safe-area env() for fixed header/footer and optional sticky CTA strip.
 */
export type FlowMobileShellProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Renders a fixed bottom region (e.g. primary pay CTA); main gets extra scroll padding. */
  stickyBottom?: ReactNode;
  className?: string;
  mainClassName?: string;
};

const HEADER_TOP_CLEARANCE =
  "pt-[calc(3.25rem+max(0px,env(safe-area-inset-top)))]";

export default function FlowMobileShell({
  title,
  actions,
  children,
  stickyBottom,
  className,
  mainClassName,
}: FlowMobileShellProps) {
  const hasSticky = Boolean(stickyBottom);

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-background",
        className,
      )}
    >
      <MobileNavbar title={title} actions={actions} />
      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          HEADER_TOP_CLEARANCE,
          hasSticky
            ? "pb-[calc(8.5rem+env(safe-area-inset-bottom))]"
            : "pb-[max(1rem,env(safe-area-inset-bottom))]",
          mainClassName,
        )}
      >
        {children}
      </main>
      {stickyBottom ? (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-background/90"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            paddingTop: "0.625rem",
          }}
        >
          <div className="app-container px-3">{stickyBottom}</div>
        </div>
      ) : null}
    </div>
  );
}
