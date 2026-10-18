"use client";

import { useEffect, useState } from "react";
import {
  publishManifestJob,
  subscribeManifestJob,
  type ManifestJobEvent,
  type ManifestProgressEvent,
} from "../manifest-job-events";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderRow = {
  order_id: string;
  status: ManifestProgressEvent["status"];
  attempt: number;
  max_attempts: number;
  message?: string;
  waybill_number?: string;
};

type JobState = {
  job_id: string;
  total: number;
  orders: Record<string, OrderRow>;
  counts?: { success: number; failed: number; skipped: number };
  completed: boolean;
};

export function ManifestProgressPanel() {
  const queryClient = useQueryClient();
  const [job, setJob] = useState<JobState | null>(null);

  useEffect(() => {
    return subscribeManifestJob((event: ManifestJobEvent) => {
      if (event.type === "started") {
        setJob({
          job_id: event.job_id,
          total: event.total,
          orders: {},
          completed: false,
        });
        return;
      }
      if (event.type === "progress") {
        setJob((prev) => {
          if (prev && prev.job_id !== event.job_id) return prev;
          const base: JobState =
            prev ?? {
              job_id: event.job_id,
              total: 0,
              orders: {},
              completed: false,
            };
          return {
            ...base,
            orders: {
              ...base.orders,
              [event.order_id]: {
                order_id: event.order_id,
                status: event.status,
                attempt: event.attempt,
                max_attempts: event.max_attempts,
                message: event.message,
                waybill_number: event.waybill_number,
              },
            },
          };
        });
        if (event.status === "success") {
          void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          void queryClient.invalidateQueries({
            queryKey: ["admin-order", event.order_id],
          });
        }
        return;
      }
      if (event.type === "completed") {
        setJob((prev) => {
          if (prev && prev.job_id !== event.job_id) return prev;
          return {
            ...(prev ?? {
              job_id: event.job_id,
              total: 0,
              orders: {},
              completed: true,
            }),
            counts: event.counts,
            completed: true,
          };
        });
        void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      }
    });
  }, [queryClient]);

  if (!job) return null;

  const rows = Object.values(job.orders);
  const statusClass = (status: OrderRow["status"]) => {
    switch (status) {
      case "success":
        return "text-emerald-700";
      case "failed":
        return "text-destructive";
      case "skipped":
        return "text-muted-foreground";
      default:
        return "text-amber-700";
    }
  };

  return (
    <Card className="mb-4 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
        <CardTitle className="text-base">
          Ready To Ship
          {job.completed && job.counts
            ? ` — ${job.counts.success} ok, ${job.counts.failed} failed, ${job.counts.skipped} skipped`
            : ` — in progress (${rows.length}/${job.total || "?"})`}
        </CardTitle>
        {job.completed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setJob(null)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="max-h-56 space-y-2 overflow-y-auto pb-3 pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Starting…</p>
        ) : (
          rows.map((row) => (
            <div
              key={row.order_id}
              className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
            >
              <span className="font-mono text-xs">{row.order_id}</span>
              <span className={cn("capitalize", statusClass(row.status))}>
                {row.status}
                {row.status === "attempting"
                  ? ` (${row.attempt}/${row.max_attempts})`
                  : null}
                {row.waybill_number ? ` · ${row.waybill_number}` : null}
                {row.message ? ` — ${row.message}` : null}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/** Re-export publish for tests; production uses NotificationSocketProvider. */
export { publishManifestJob };
