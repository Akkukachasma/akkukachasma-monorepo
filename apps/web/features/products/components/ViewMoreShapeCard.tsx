"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewMoreShapeCardProps {
  shapeSlug: string;
  shapeTitle?: string;
  className?: string;
}

export default function ViewMoreShapeCard({
  shapeSlug,
  shapeTitle,
  className,
}: ViewMoreShapeCardProps) {
  const href = `/shapes/${shapeSlug}`;
  const label = shapeTitle?.trim() || "this shape";

  return (
    <Link
      href={href}
      className={cn(
        "flex h-full min-h-[280px] w-full max-w-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/50",
        className,
      )}
    >
      <span className="text-base font-semibold text-foreground">View more</span>
      <span className="max-w-[12rem] text-sm text-muted-foreground">
        Browse all {label} frames
      </span>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
        See all
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
