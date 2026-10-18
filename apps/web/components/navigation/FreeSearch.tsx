"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Search,
  FolderTree,
  Hexagon,
  Users,
  Package,
  ChevronRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useSearchSuggestions } from "@/features/hero-search/queries/useSearchSuggestions";
import type { SearchSuggestion } from "@/features/hero-search/queries/useSearchSuggestions";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

const TYPE_CONFIG = {
  category: {
    icon: FolderTree,
    label: "Category",
    getHref: (s: Extract<SearchSuggestion, { type: "category" }>) =>
      `/categories/${s.slug}`,
    getTitle: (s: Extract<SearchSuggestion, { type: "category" }>) => s.title,
  },
  shape: {
    icon: Hexagon,
    label: "Shape",
    getHref: (s: Extract<SearchSuggestion, { type: "shape" }>) =>
      `/shapes/${s.slug}`,
    getTitle: (s: Extract<SearchSuggestion, { type: "shape" }>) => s.title,
  },
  gender: {
    icon: Users,
    label: "Gender",
    getHref: (s: Extract<SearchSuggestion, { type: "gender" }>) =>
      `/search?gender=${s.value}`,
    getTitle: (s: Extract<SearchSuggestion, { type: "gender" }>) => s.label,
  },
  product: {
    icon: Package,
    label: "Product",
    getHref: (s: Extract<SearchSuggestion, { type: "product" }>) =>
      s.model_number
        ? `/${s.slug}/${s.model_number}`
        : `/search?search=${encodeURIComponent(s.model_name)}`,
    getTitle: (s: Extract<SearchSuggestion, { type: "product" }>) =>
      s.model_name,
  },
} as const;

function getSuggestionKey(s: SearchSuggestion): string {
  switch (s.type) {
    case "category":
      return `cat-${s.slug}`;
    case "shape":
      return `shape-${s.slug}`;
    case "gender":
      return `gender-${s.value}`;
    case "product":
      return `prod-${s.slug}-${s.model_number ?? ""}`;
  }
}

function getSuggestionHref(s: SearchSuggestion): string {
  switch (s.type) {
    case "category":
      return TYPE_CONFIG.category.getHref(s);
    case "shape":
      return TYPE_CONFIG.shape.getHref(s);
    case "gender":
      return TYPE_CONFIG.gender.getHref(s);
    case "product":
      return TYPE_CONFIG.product.getHref(s);
  }
}

function SuggestionCard({
  suggestion,
  onSelect,
}: {
  suggestion: SearchSuggestion;
  onSelect: () => void;
}) {
  const config = TYPE_CONFIG[suggestion.type];
  const Icon = config.icon;
  const title = config.getTitle(suggestion as any);
  const href = getSuggestionHref(suggestion);

  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
        "hover:bg-muted/60 focus:bg-muted/60 focus:outline-none",
      )}
    >
      {suggestion.type === "product" && suggestion.image_url ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={suggestion.image_url}
            alt={title}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted/80">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{config.label}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function SearchResultsList({
  query,
  isLoading,
  suggestions,
  onSelectSuggestion,
}: {
  query: string;
  isLoading: boolean;
  suggestions: SearchSuggestion[];
  onSelectSuggestion: () => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto border-t p-2 md:max-h-[min(60vh,400px)]">
      {query.trim().length < 2 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No results found. Try a different search.
        </div>
      ) : (
        <ul className="space-y-0.5">
          {suggestions.map((s) => (
            <li key={getSuggestionKey(s)}>
              <SuggestionCard
                suggestion={s}
                onSelect={onSelectSuggestion}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const FreeSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  const { data: suggestions = [], isLoading } = useSearchSuggestions(
    query,
    open,
  );

  const handleOpenChange = useCallback((next: boolean) => {
    if (next) setSearchMounted(true);
    setOpen(next);
    if (!next) setQuery("");
    else setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
          setOpen(false);
          router.push(`/search?search=${encodeURIComponent(trimmed)}`);
        }
      }
    },
    [query, router],
  );

  const inputProps = {
    ref: inputRef,
    type: "search" as const,
    placeholder: "Search products...",
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setQuery(e.target.value),
    onKeyDown: handleKeyDown,
    autoComplete: "off" as const,
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => handleOpenChange(true)}
        className="shrink-0"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isMobile && searchMounted ? (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          {open ? (
          <SheetContent
            side="bottom"
            showCloseIcon={false}
            className={cn(
              "flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader className="shrink-0 space-y-0 p-4 pb-2 text-left">
              <SheetTitle className="sr-only">Search products</SheetTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Close search"
                  onClick={() => handleOpenChange(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Input
                  {...inputProps}
                  className="h-11 min-w-0 flex-1 text-base"
                />
              </div>
            </SheetHeader>
            <SearchResultsList
              query={query}
              isLoading={isLoading}
              suggestions={suggestions}
              onSelectSuggestion={() => handleOpenChange(false)}
            />
          </SheetContent>
          ) : null}
        </Sheet>
      ) : !isMobile ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            showCloseIcon={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="flex max-h-[100vh] max-w-xl flex-col gap-0 overflow-hidden !p-0"
          >
            <DialogHeader className="shrink-0 space-y-0 p-4 pb-2 text-left">
              <DialogTitle className="sr-only">Search products</DialogTitle>
              <div className="relative pr-12">
                <Input
                  {...inputProps}
                  className="h-11 w-full min-w-0 text-base"
                />
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>
            <SearchResultsList
              query={query}
              isLoading={isLoading}
              suggestions={suggestions}
              onSelectSuggestion={() => handleOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

export default FreeSearch;
