"use client";
import React from "react";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/products/useItems";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPage } from "@/store/products/data.slice";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function visiblePageItems(
  page: number,
  pageCount: number,
): (number | "ellipsis")[] {
  if (pageCount <= 1) return [1];
  const set = new Set<number>();
  set.add(1);
  set.add(pageCount);
  set.add(page);
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= pageCount) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]!);
  }
  return out;
}

const List = () => {
  const dispatch = useAppDispatch();
  const { search_term, stock_tab, sort_by } = useAppSelector(
    (s) => s.productStore.dataStore,
  );
  const filterKey = React.useRef({ search_term, stock_tab, sort_by });

  React.useEffect(() => {
    const prev = filterKey.current;
    if (
      prev.search_term !== search_term ||
      prev.stock_tab !== stock_tab ||
      prev.sort_by !== sort_by
    ) {
      dispatch(setPage(1));
    }
    filterKey.current = { search_term, stock_tab, sort_by };
  }, [search_term, stock_tab, sort_by, dispatch]);

  const {
    data,
    isLoading,
    isFetching,
    page,
    pageCount,
  } = useItems();

  const pageItems = visiblePageItems(page, pageCount);

  if (isLoading) {
    return (
      <table
        className="ak-table w-full table-fixed"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        <thead>
          <tr>
            <th className="min-w-[7.5rem]">Model number</th>
            <th className="min-w-[6.5rem] text-left">Shape</th>
            <th className="min-w-[7rem] text-left">Frame size</th>
            <th className="w-20 min-w-[5rem] text-right">In stock</th>
            <th className="min-w-[6.5rem] text-right">Listing</th>
            <th className="min-w-[6.5rem] text-right">Selling</th>
            <th className="min-w-[7rem] text-left">Category</th>
            <th className="w-[5.5rem] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(4)
            .fill("")
            ?.map((d, index) => {
              return <ListItem key={index} />;
            })}
        </tbody>
      </table>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4",
        isFetching && "opacity-70 transition-opacity",
      )}
    >
      <table
        className="ak-table w-full table-fixed"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        <thead>
          <tr>
            <th className="min-w-[7.5rem]">Model number</th>
            <th className="min-w-[6.5rem] text-left">Shape</th>
            <th className="min-w-[7rem] text-left">Frame size</th>
            <th className="w-20 min-w-[5rem] text-right">In stock</th>
            <th className="min-w-[6.5rem] text-right">Listing</th>
            <th className="min-w-[6.5rem] text-right">Selling</th>
            <th className="min-w-[7rem] text-left">Category</th>
            <th className="w-[5.5rem] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((d) => {
            return <ListItem key={d.id} data={d} />;
          })}
        </tbody>
      </table>

      {pageCount > 1 ? (
        <Pagination>
          <PaginationContent className="flex-wrap">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={cn(
                  page <= 1 && "pointer-events-none opacity-50",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) dispatch(setPage(page - 1));
                }}
              />
            </PaginationItem>
            {pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    size="icon"
                    isActive={item === page}
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(setPage(item));
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                className={cn(
                  page >= pageCount && "pointer-events-none opacity-50",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pageCount) dispatch(setPage(page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
};

export default List;
