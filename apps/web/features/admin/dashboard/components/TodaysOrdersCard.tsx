"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Package, User } from "lucide-react";
import useTodaysOrders from "../queries/useTodaysOrders";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const TodaysOrdersCard: React.FC = () => {
  const { data: orders, isLoading } = useTodaysOrders();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "initiated":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "picked":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "initiated":
        return "🔄";
      case "confirmed":
        return "✅";
      case "picked":
        return "📦";
      case "delivered":
        return "🎉";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Today's Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Today's Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No orders received today</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Today's Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/manage/orders/${order.id}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    typeof order.user.avatar === "string"
                      ? order.user.avatar
                      : order.user.avatar?.url
                  }
                />
                <AvatarFallback>
                  {order.user.name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">
                    {order.user.name || "Unknown User"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {order.order_items.length} items
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{dayjs(order.created_at).format("HH:mm A")}</span>
                  <span>•</span>
                  <span>₹{order.pricing?.total?.toLocaleString() || "0"}</span>
                  {order.payment && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{order.payment.mode}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                  <span className="mr-1">{getStatusIcon(order.status)}</span>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/manage/orders/${order.id}`);
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {orders.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/manage/orders")}
            >
              View All Orders
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysOrdersCard;
