"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import useNotifications from "../queries/useNotifications";
import {
  useMarkAllAdminNotificationsRead,
  useMarkAdminNotificationRead,
} from "../mutations/useAdminNotificationMutations";
import {
  notificationBody,
  styleForNotificationType,
} from "@/features/admin/notifications/notification-ui";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NotificationsCard: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications(12);
  const markAll = useMarkAllAdminNotificationsRead();
  const markOne = useMarkAdminNotificationRead();
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p>No notifications yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {notifications.map((notification) => {
            const text = notificationBody(notification);
            const { Icon, iconWrap, label, labelClass } =
              styleForNotificationType(notification.type);
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  !notification.isRead
                    ? "border-blue-200 bg-blue-50"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className={cn("rounded-full p-2", iconWrap)}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`font-medium ${!notification.isRead ? "text-blue-900" : ""}`}
                    >
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  {text ? (
                    <p
                      className={`text-sm ${!notification.isRead ? "text-blue-700" : "text-muted-foreground"}`}
                    >
                      {text}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {dayjs(notification.timestamp).format("MMM DD, HH:mm")}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", labelClass)}
                    >
                      {label}
                    </Badge>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={markOne.isPending}
                      onClick={() => markOne.mutate(notification.id)}
                    >
                      Read
                    </Button>
                  )}
                  {notification.entityType === "Order" &&
                    notification.entityId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          router.push(
                            `/manage/orders/${notification.entityId}`,
                          )
                        }
                      >
                        Order
                      </Button>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length >= 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/manage/notifications")}
            >
              View all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
