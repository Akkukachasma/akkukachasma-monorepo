"use client";

import PageWrapper from "@/components/wrappers/PageWrapper";
import {
  useCustomerNotifications,
  useMarkAllCustomerNotificationsRead,
  useMarkCustomerNotificationRead,
} from "@/features/notifications/useCustomerNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, Truck } from "lucide-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function CustomerNotificationsPage() {
  const { data: items, isLoading } = useCustomerNotifications(50);
  const markAll = useMarkAllCustomerNotificationsRead();
  const markOne = useMarkCustomerNotificationRead();
  const router = useRouter();
  const unread = items?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="flex h-full flex-col">
      <PageWrapper className="flex-grow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {unread > 0 ? (
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200">
              {unread} unread
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">You are all caught up.</span>
          )}
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-10 touch-manipulation sm:min-h-9"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        )}

        {!isLoading && (!items || items.length === 0) && (
          <div className="portal-empty">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300">
              <Bell className="size-7" />
            </div>
            No notifications yet.
          </div>
        )}

        {!isLoading && items && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((n) => {
              const body = n.message ?? n.body ?? "";
              return (
                <li
                  key={n.id}
                  className={`flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-start sm:justify-between ${
                    !n.isRead
                      ? "bg-orange-500/5"
                      : "bg-card"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        n.type.toLowerCase().includes("ship")
                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {n.type.toLowerCase().includes("ship") ? (
                        <Truck className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{n.title}</div>
                      {body ? (
                        <p className="mt-1 break-words text-sm text-muted-foreground">{body}</p>
                      ) : null}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {dayjs(n.timestamp).format("MMM D, YYYY · h:mm A")}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:pl-0">
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="min-h-10 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                        disabled={markOne.isPending}
                        onClick={() => markOne.mutate(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    {n.entityType === "Order" && n.entityId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-10 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                        onClick={() => router.push(`/customers/orders`)}
                      >
                        My orders
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PageWrapper>
    </div>
  );
}
