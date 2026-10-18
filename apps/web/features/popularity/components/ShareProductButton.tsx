"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { Share2 } from "lucide-react";
import { recordProductShare } from "../api/popularity.api";
import { cn } from "@/lib/utils";

export type ShareProductButtonProps = {
  productColorId: string;
  /** Path only, e.g. `/slug/model` — full URL is built in the browser. */
  pathname: string;
  productTitle?: string;
  className?: string;
  isMobile?: boolean;
};

export default function ShareProductButton({
  productColorId,
  pathname,
  productTitle,
  className,
  isMobile,
}: ShareProductButtonProps) {
  const onShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
        : pathname;

    try {
      await recordProductShare(productColorId);
    } catch {
      /* still try native / clipboard share */
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: productTitle,
          url: shareUrl,
        });
        return;
      }
    } catch {
      /* user cancelled or share failed */
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ description: "Link copied to clipboard" });
    } catch {
      toast({
        description: "Could not share or copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant={isMobile ? "default" : "ghost"}
      size="icon"
      className={cn("", isMobile && "shadow-none bg-white text-foreground rounded-full", className)}
      aria-label="Share product"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        void onShare();
      }}
    >
      <Share2 className="size-5 text-muted-foreground" />
    </Button>
  );
}
