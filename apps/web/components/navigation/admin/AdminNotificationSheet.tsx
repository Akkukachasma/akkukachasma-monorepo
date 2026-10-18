"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ChevronRight,
  Inbox,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useNotifications, {
  ADMIN_NOTIFICATION_PANEL_TAKE,
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

function NotificationItem({
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
  const { Icon, iconWrap, accent } = styleForNotificationType(
    notification.type,
  );
  const body = notificationBody(notification);
  const canOpenOrder =
    notification.entityType === "Order" && !!notification.entityId;

  return (
    <li className="group relative">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/70 bg-card/80",
          "transition-colors hover:border-border hover:bg-muted/40",
        )}
      >
        <span
          className={cn("absolute inset-y-0 left-0 w-0.5", accent)}
          aria-hidden
        />
        <div className="flex gap-3 p-3.5 pl-4">
          <div
            className={cn(
              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
              iconWrap,
            )}
          >
            <Icon className="size-4" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-snug tracking-tight text-foreground">
                  {notification.title}
                </p>
                {body ? (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      disabled={marking}
                      aria-label="Mark as read"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkRead();
                      }}
                    >
                      <Check className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Mark as read</TooltipContent>
                </Tooltip>
                {canOpenOrder ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        aria-label="Open order"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpenOrder?.();
                        }}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Open order</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <time
                dateTime={notification.timestamp}
                className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80"
              >
                {dayjs(notification.timestamp).fromNow()}
              </time>
              {canOpenOrder ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenOrder?.();
                  }}
                >
                  View order
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function AdminNotificationSheet() {
  const [open, setOpen] = useState(false);
  const { data: items, isLoading, isFetching } = useNotifications(
    ADMIN_NOTIFICATION_PANEL_TAKE,
    { unreadOnly: true },
  );
  const markAll = useMarkAllAdminNotificationsRead();
  const markOne = useMarkAdminNotificationRead();
  const router = useRouter();
  const unread = items?.length ?? 0;

  return (
    <TooltipProvider delayDuration={200}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-10 shrink-0 touch-manipulation sm:size-9"
            aria-label={
              unread > 0
                ? `Notifications, ${unread} unread`
                : "Notifications"
            }
          >
            <Bell className="size-5" />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white shadow-sm">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          showCloseIcon={false}
          className="flex w-full flex-col gap-0 border-l border-border/80 bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="space-y-0 border-b border-border/70 bg-gradient-to-b from-emerald-500/[0.06] to-transparent px-4 py-4 text-left">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base tracking-tight">
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {isLoading
                    ? "Loading…"
                    : unread > 0
                      ? `${unread} unread · up to ${ADMIN_NOTIFICATION_PANEL_TAKE}`
                      : "You’re all caught up"}
                  {isFetching && !isLoading ? " · refreshing" : ""}
                </SheetDescription>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {unread > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    disabled={markAll.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAll.mutate();
                    }}
                  >
                    <CheckCheck className="size-3.5" />
                    Mark all
                  </Button>
                ) : null}
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {isLoading ? (
              <ul className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-border/50 p-3.5"
                  >
                    <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
                      <div className="h-2.5 w-16 animate-pulse rounded bg-muted/50" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {!isLoading && (!items || items.length === 0) ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Inbox className="size-6" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No unread notifications
                </p>
                <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
                  New orders and updates will show up here in real time.
                </p>
              </div>
            ) : null}

            {!isLoading && items && items.length > 0 ? (
              <ul className="space-y-2.5">
                {items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    marking={markOne.isPending}
                    onMarkRead={() => markOne.mutate(n.id)}
                    onOpenOrder={
                      n.entityType === "Order" && n.entityId
                        ? () => {
                            setOpen(false);
                            router.push(`/manage/orders/${n.entityId}`);
                          }
                        : undefined
                    }
                  />
                ))}
              </ul>
            ) : null}
          </div>

          <SheetFooter className="border-t border-border/70 bg-muted/20 px-4 py-3 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              asChild
            >
              <Link href="/manage/notifications" onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
