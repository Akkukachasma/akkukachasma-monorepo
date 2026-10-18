"use client";
import PlusIcon from "@/components/icons/PlusIcon";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/products/form.slice";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  setSearchTerm,
  setStockTab,
  type ProductListStockTab,
} from "@/store/products/data.slice";
import React from "react";
import { Search } from "lucide-react";

const STOCK_TABS: { id: ProductListStockTab; label: string }[] = [
  { id: "all", label: "All variants" },
  { id: "out_of_stock", label: "Out of stock" },
];

const HeaderButton = () => {
  const dispatch = useAppDispatch();
  const { total, stock_tab, search_term } = useAppSelector(
    (store) => store.productStore.dataStore,
  );
  const [query, setQuery] = React.useState(search_term);

  React.useEffect(() => {
    setQuery(search_term);
  }, [search_term]);

  React.useEffect(() => {
    const debounceId = setTimeout(() => dispatch(setSearchTerm(query)), 350);
    return () => clearTimeout(debounceId);
  }, [query, dispatch]);

  return (
    <HeaderWrapper
      title="Products"
      tagline={`${total} variant${total === 1 ? "" : "s"}`}
    >
      <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div
          className="inline-flex h-9 w-full shrink-0 rounded-lg bg-muted p-1 sm:w-auto"
          role="tablist"
          aria-label="Filter by stock"
        >
          {STOCK_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={stock_tab === id}
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-initial sm:px-4",
                stock_tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => dispatch(setStockTab(id))}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 sm:max-w-xs sm:flex-initial md:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9 pr-3"
            aria-label="Search products"
          />
        </div>

        <Button
          type="button"
          onClick={() => dispatch(showModal(true))}
          className="h-9 shrink-0 gap-2"
        >
          <PlusIcon />
          Add product
        </Button>
      </div>
    </HeaderWrapper>
  );
};

export default HeaderButton;
