"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export function DataTablePagination({
  page,
  pageCount,
  onPageChange,
  disabled,
  className,
}: DataTablePaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 py-4",
        className,
      )}
    >
      <div className="mr-auto text-sm text-muted-foreground tabular-nums">
        Page {page} of {pageCount}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
