"use client";

import * as React from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getPaginationRange } from "../lib/pagination-range";

const PAGE_SIZE_OPTIONS = [20, 40, 50, 100] as const;

export type ProductListingPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  className?: string;
};

export function ProductListingPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  className,
}: ProductListingPaginationProps) {
  const [jumpValue, setJumpValue] = React.useState("");
  const pages = React.useMemo(
    () => getPaginationRange(page, totalPages, 1),
    [page, totalPages],
  );

  if (totalPages <= 0 || total === 0) {
    return null;
  }

  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onPageChange(next);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    if (!Number.isFinite(n)) return;
    go(n);
    setJumpValue("");
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing page {page} of {totalPages}
        <span className="hidden sm:inline"> · </span>
        <span className="sm:inline">
          {" "}
          ({total.toLocaleString()} results)
        </span>
      </p>

      <nav
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
        aria-label="Product list pagination"
      >
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span id="page-size-label" className="text-sm text-muted-foreground">
              Per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
              disabled={isLoading}
            >
              <SelectTrigger
                className="h-9 w-[4.5rem]"
                aria-labelledby="page-size-label"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="First page"
            disabled={isLoading || page <= 1}
            onClick={() => go(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Previous page"
            disabled={isLoading || page <= 1}
            onClick={() => go(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "outline"}
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={isLoading}
                onClick={() => go(item)}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Next page"
            disabled={isLoading || page >= totalPages}
            onClick={() => go(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Last page"
            disabled={isLoading || page >= totalPages}
            onClick={() => go(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <form
          onSubmit={handleJumpSubmit}
          className="flex items-center gap-2"
        >
          <label htmlFor="product-page-jump" className="sr-only">
            Jump to page
          </label>
          <Input
            id="product-page-jump"
            type="number"
            min={1}
            max={totalPages}
            inputMode="numeric"
            placeholder="Page #"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            className="h-9 w-20"
            disabled={isLoading}
          />
          <Button type="submit" variant="secondary" size="sm" disabled={isLoading}>
            Go
          </Button>
        </form>
      </nav>
    </div>
  );
}
