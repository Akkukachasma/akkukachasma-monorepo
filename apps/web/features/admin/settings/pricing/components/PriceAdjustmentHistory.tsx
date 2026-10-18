"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import type {
  PriceAdjustmentBatch,
  PriceAdjustmentStatus,
} from "../queries/usePriceAdjustments";
import { resolvePriceAdjustmentStatus } from "../queries/usePriceAdjustments";

type PriceAdjustmentHistoryProps = {
  items: PriceAdjustmentBatch[];
  isLoading?: boolean;
};

function statusBadgeVariant(
  status: PriceAdjustmentStatus,
): "default" | "secondary" | "destructive" | "success" | "outline" {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    case "processing":
      return "default";
    case "pending":
    default:
      return "secondary";
  }
}

const PriceAdjustmentHistory: React.FC<PriceAdjustmentHistoryProps> = ({
  items,
  isLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustment history</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading history…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No price adjustments yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((row) => {
              const status = resolvePriceAdjustmentStatus(row);
              const inProgress =
                status === "pending" || status === "processing";
              return (
                <li
                  key={row.id}
                  className="rounded-lg border p-3 text-sm space-y-1.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={statusBadgeVariant(status)}
                      className="capitalize"
                    >
                      {status}
                    </Badge>
                    <Badge
                      variant={
                        row.direction === "increase" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {row.direction}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {row.mode === "percentage"
                        ? `${row.value}%`
                        : `₹${row.value}`}
                    </Badge>
                    <span className="text-muted-foreground">
                      {dayjs(row.created_at).format("MMM DD, YYYY HH:mm")}
                    </span>
                  </div>
                  {inProgress ? (
                    <p className="text-muted-foreground">
                      Updating {row.products_total} product
                      {row.products_total === 1 ? "" : "s"}…
                    </p>
                  ) : (
                    <p>
                      Updated <strong>{row.products_updated}</strong> of{" "}
                      {row.products_total} product
                      {row.products_total === 1 ? "" : "s"}
                      {row.products_clamped > 0
                        ? ` · ${row.products_clamped} clamped to ₹0.01`
                        : ""}
                      {row.products_skipped > 0
                        ? ` · ${row.products_skipped} unchanged`
                        : ""}
                    </p>
                  )}
                  {status === "failed" && row.error_message ? (
                    <p className="text-destructive">{row.error_message}</p>
                  ) : null}
                  {row.created_by?.name ? (
                    <p className="text-muted-foreground">
                      By {row.created_by.name}
                      {row.created_by.email
                        ? ` (${row.created_by.email})`
                        : ""}
                    </p>
                  ) : null}
                  {row.notes ? (
                    <p className="text-muted-foreground">Notes: {row.notes}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAdjustmentHistory;
