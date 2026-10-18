"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import OrderListItem from "./OrderListItem";
import type { Order } from "../queries/useGetOrders";
import { isOrderExportSelectable } from "../utils/export-eligibility";
import { isOrderManifestSelectable } from "../utils/manifest-eligibility";
import { visiblePageItems } from "../utils/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Selectable for any bulk action (export and/or Ready To Ship). */
export function isOrderBulkSelectable(order: Order): boolean {
  return isOrderExportSelectable(order) || isOrderManifestSelectable(order);
}

export type OrderListProps = {
  page: number;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  onPageChange: (page: number) => void;
  orders: Order[];
  isLoading: boolean;
  isFetching: boolean;
  total: number;
  selectedIds: Set<string>;
  onToggleId: (id: string, selected: boolean) => void;
  onTogglePageIds: (ids: string[], selected: boolean) => void;
};

const OrderList: React.FC<OrderListProps> = ({
  page,
  pageSize,
  setPageSize,
  onPageChange,
  orders,
  isLoading,
  isFetching,
  total,
  selectedIds,
  onToggleId,
  onTogglePageIds,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = visiblePageItems(page, totalPages);
  const eligiblePageIds = orders
    .filter(isOrderBulkSelectable)
    .map((o) => o.id);
  const selectedEligibleOnPage = eligiblePageIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allOnPageSelected =
    eligiblePageIds.length > 0 &&
    selectedEligibleOnPage === eligiblePageIds.length;
  const someOnPageSelected =
    selectedEligibleOnPage > 0 &&
    selectedEligibleOnPage < eligiblePageIds.length;

  const headerChecked: boolean | "indeterminate" = someOnPageSelected
    ? "indeterminate"
    : allOnPageSelected;

  const handleToggleId = (id: string, selected: boolean) => {
    const o = orders.find((x) => x.id === id);
    if (!o || !isOrderBulkSelectable(o)) return;
    onToggleId(id, selected);
  };

  const handleTogglePageIds = (selected: boolean) => {
    onTogglePageIds(eligiblePageIds, selected);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <table
          className="ak-table"
          style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
        >
          <thead>
            <tr>
              <th className="w-12" aria-label="Select" />
              <th>Customer</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Items</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pageSize }).map((_, i) => (
              <OrderListItem key={i} order={null} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {!orders?.length ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div
            className={cn(
              "flex flex-col gap-4",
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            <table
              className="ak-table"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <thead>
                <tr>
                  <th className="w-12 flex-shrink-0">
                    <span className="sr-only">Select rows on this page</span>
                    <div>
                      <Checkbox
                        checked={headerChecked}
                        disabled={eligiblePageIds.length === 0}
                        onCheckedChange={(checked) => {
                          const select = checked === true;
                          handleTogglePageIds(select);
                        }}
                        aria-label="Select all actionable orders on this page"
                        className="-translate-x-[8px] translate-y-[3px]"
                      />
                    </div>
                  </th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderListItem
                    key={order.id}
                    order={order}
                    selected={selectedIds.has(order.id)}
                    onSelectChange={(sel) => handleToggleId(order.id, sel)}
                    selectionActive={selectedIds.size > 0}
                  />
                ))}
              </tbody>
            </table>

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground flex-shrink-0">
                Page {page} of {totalPages}
              </p>
              <Pagination className="flex-1 basis-0">
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={cn(
                        page <= 1 && "pointer-events-none opacity-50",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) onPageChange(page - 1);
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
                            onPageChange(item);
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
                        page >= totalPages &&
                        "pointer-events-none opacity-50",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) onPageChange(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="flex w-[250px] items-center gap-2 flex-shrink-0">
                <p className="text-sm text-muted-foreground">Per page</p>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="2000">2000</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">orders</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
};

export default OrderList;
