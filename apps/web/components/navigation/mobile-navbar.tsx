"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RenderCart from "@/components/navigation/RenderCart";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type MobileNavbarProps = {
    title?: string;
    /** Share, wishlist, etc. — rendered before the cart icon. */
    actions?: ReactNode;
    className?: string;
};

/**
 * App-style top bar for mobile PDP: back, centered title, optional actions + cart.
 */
export default function MobileNavbar({
    title,
    actions,
    className,
}: MobileNavbarProps) {
    const router = useRouter();

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-40 flex min-h-[3.25rem] items-center gap-1 justify-between",
                "pt-[max(0px,env(safe-area-inset-top))] pl-[max(4px,env(safe-area-inset-left))] pr-[max(4px,env(safe-area-inset-right))]",
                className,
            )}
        >
            <Button
                type="button"
                size="icon"
                className="shrink-0 rounded-full bg-white text-foreground shadow-none"
                onClick={() => router.back()}
                aria-label="Back"
            >
                <ChevronLeft className="size-6" strokeWidth={2.2} />
            </Button>

            {title && (
                <h1 className="min-w-0 flex-1 truncate px-1 text-center text-sm font-semibold leading-tight text-foreground">
                    {title}
                </h1>
            )}

            <div className="flex shrink-0 items-center gap-0.5">
                {actions}
                <RenderCart isMobile className="shrink-0 px-0" />
            </div>
        </header>
    );
}
