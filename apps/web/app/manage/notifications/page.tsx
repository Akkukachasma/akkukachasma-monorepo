"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Inbox,
  MailOpen,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PageWrapper from "@/components/wrappers/PageWrapper";
import useNotifications, {
  type Notification,
} from "@/features/admin/dashboard/queries/useNotifications";
import {
  useMarkAllAdminNotificationsRead,
  useMarkAdminNotificationRead,
} from "@/features/admin/dashboard/mutations/useAdminNotificationMutations";
import {
  notificationBody,
  styleForNotificationType,
} from "@/features/admin/notifications/notification-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

type Filter = "all" | "unread";

function FeedItem({
  notification,
  marking,
  onMarkRead,
  onOpenOrder,
}: {
  notification: Notification;
  marking: boolean;
  onMarkRead: () => void;
  onOpenOrder?: () => void;
}) {
  const { Icon, iconWrap, accent, label, labelClass } =
    styleForNotificationType(notification.type);
  const body = notificationBody(notification);
  const unread = !notification.isRead;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-colors hover:cursor-pointer hover:border-emerald-500",
        unread
          ? "border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.07] to-card shadow-sm"
          : "border-border/60 bg-card/60",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-3 left-0 w-1 rounded-r-full",
          unread ? accent : "bg-transparent",
        )}
        aria-hidden
      />
      <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-start sm:gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            iconWrap,
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-[15px] tracking-tight text-foreground",
                unread ? "font-semibold" : "font-medium",
              )}
            >
              {notification.title}
            </h3>
            {unread ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <span className="size-1.5 rounded-full bg-white/90" />
                New
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                labelClass,
              )}
            >
              {label}
            </span>
          </div>

          {body ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time dateTime={notification.timestamp}>
              {dayjs(notification.timestamp).fromNow()}
              <span className="mx-1.5 text-border">·</span>
              {dayjs(notification.timestamp).format("MMM D, YYYY · h:mm A")}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-stretch">
          {unread ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-9 gap-1.5 rounded-xl"
              disabled={marking}
              onClick={onMarkRead}
            >
              <Check className="size-3.5" />
              Mark read
            </Button>
          ) : (
            <span className="hidden items-center justify-center gap-1.5 rounded-xl px-3 text-xs text-muted-foreground sm:inline-flex">
              <MailOpen className="size-3.5" />
              Read
            </span>
          )}
          {onOpenOrder ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 rounded-xl"
              onClick={onOpenOrder}
            >
              Open order
              <ChevronRight className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function ManageNotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: items, isLoading, isFetching } = useNotifications(80);
  const markAll = useMarkAllAdminNotificationsRead();
  const markOne = useMarkAdminNotificationRead();
  const router = useRouter();

  const unread = items?.filter((n) => !n.isRead).length ?? 0;

  const visible = useMemo(() => {
    if (!items) return [];
    if (filter === "unread") return items.filter((n) => !n.isRead);
    return items;
  }, [items, filter]);

  return (
    <div className="flex h-full flex-col">
      <HeaderWrapper title="Notifications" className="flex-shrink-0">
        {unread > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 rounded-xl"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        ) : null}
      </HeaderWrapper>

      <PageWrapper className="flex-grow space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-border/70 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === "unread"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Unread
              {unread > 0 ? (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px] tabular-nums"
                >
                  {unread}
                </Badge>
              ) : null}
            </button>
          </div>
          {isFetching && !isLoading ? (
            <p className="text-xs text-muted-foreground">Refreshing…</p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-border/50 p-4"
              >
                <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted/70" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {filter === "unread" ? (
                <MailOpen className="size-6" />
              ) : (
                <Inbox className="size-6" />
              )}
            </div>
            <p className="text-base font-medium text-foreground">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {filter === "unread"
                ? "You’re caught up. Switch to All to browse history."
                : "New orders will appear here when customers pay or confirm COD."}
            </p>
            {filter === "unread" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-xl"
                onClick={() => setFilter("all")}
              >
                View all
              </Button>
            ) : null}
          </div>
        ) : null}

        {!isLoading && visible.length > 0 ? (
          <ul className="space-y-3">
            {visible.map((n) => (
              <li key={n.id}>
                <FeedItem
                  notification={n}
                  marking={markOne.isPending}
                  onMarkRead={() => markOne.mutate(n.id)}
                  onOpenOrder={
                    n.entityType === "Order" && n.entityId
                      ? () => router.push(`/manage/orders/${n.entityId}`)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : null}
      </PageWrapper>
    </div>
  );
}
