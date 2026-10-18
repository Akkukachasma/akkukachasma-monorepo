"use client";

import { cn } from "@/lib/utils";

export interface DataTableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
