"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, ExternalLink } from "lucide-react";
import Link from "next/link";
import useGetMyOrders, { MyOrder } from "../useGetMyOrders";
import dayjs from "dayjs";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200";
    case "picked":
      return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200";
    case "delivered":
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const OrderCard = ({ order }: { order: MyOrder }) => {
  const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Package className="size-4" />
            </span>
            <span className="truncate font-medium">
              Order #{order.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {dayjs(order.created_at).format("DD MMM YYYY")} · {itemCount} item
          {itemCount !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            ₹{order.pricing?.total?.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 w-full touch-manipulation sm:min-h-9 sm:w-auto"
            asChild
          >
            <Link href={`/track-order?orderId=${order.id}`}>
              <Truck className="mr-2 h-4 w-4" />
              Track Order
            </Link>
          </Button>
          {order.tracking_url && (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-10 w-full touch-manipulation sm:min-h-9 sm:w-auto"
              asChild
            >
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Delhivery
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomerOrdersList() {
  const { data, isLoading, error } = useGetMyOrders(1, 20);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-none">
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load orders. Please try again.
      </p>
    );
  }

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="portal-empty mx-auto max-w-md">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300">
          <Package className="size-7" />
        </div>
        <p className="font-medium text-foreground">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order history will appear here
        </p>
        <Button
          asChild
          className="mt-4 min-h-10 touch-manipulation bg-emerald-600 hover:bg-emerald-700"
        >
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
