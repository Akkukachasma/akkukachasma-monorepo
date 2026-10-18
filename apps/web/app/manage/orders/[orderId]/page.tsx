"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  IndianRupee,
  FileText,
} from "lucide-react";
import useGetOrder from "@/features/admin/orders/queries/useGetOrder";
import useUpdateOrderStatus, {
  type OrderStatusValue,
} from "@/features/admin/orders/mutations/useUpdateOrderStatus";
import dayjs from "dayjs";
import PageWrapper from "@/components/wrappers/PageWrapper";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import OrderStatusTracker from "@/features/admin/orders/components/OrderStatusTracker";
import OrderShipmentCard from "@/features/admin/orders/components/OrderShipmentCard";
import OrderCustomerDetails from "@/features/admin/orders/components/OrderCustomerDetails";
import OrderItemsDetails from "@/features/admin/orders/components/OrderItemsDetails";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderDetailsPage = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: order, isLoading, error } = useGetOrder(orderId);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "initiated":
        return "!bg-blue-100 !text-blue-800";
      case "confirmed":
        return "!bg-green-100 !text-green-800";
      case "picked":
        return "!bg-orange-100 !text-orange-800";
      case "delivered":
        return "!bg-purple-100 !text-purple-800";
      case "cancelled":
        return "!bg-red-100 !text-red-800";
      default:
        return "!bg-gray-100 !text-gray-800";
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentModeColor = (mode?: string) => {
    switch (mode) {
      case "online":
        return "bg-blue-100 text-blue-800";
      case "cod":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <HeaderWrapper
          title="Order Details"
          tagline="Loading order information..."
          onBackUrl="/manage/orders"
        />

        <PageWrapper>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-4 w-full bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <HeaderWrapper
          title="Order Details"
          tagline="Order not found"
          onBackUrl="/manage/orders"
        />

        <PageWrapper>
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Order not found</p>
            </CardContent>
          </Card>
        </PageWrapper>
      </div>
    );
  }

  const couponCode =
    order.pricing.applied_coupon?.coupon?.code ||
    order.pricing.applied_coupon?.code;
  const couponDiscount =
    order.pricing.applied_coupon?.discount ??
    order.pricing.applied_coupon?.coupon?.discount;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <HeaderWrapper
        title="Order Details"
        tagline={
          order.invoice?.invoice_number
            ? `${order.invoice.invoice_number} · Order #${order.id}`
            : `Order #${order.id}`
        }
        onBackUrl="/manage/orders"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/manage/orders/${orderId}/invoice`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          </Link>
          <Badge variant="success" className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">
              Set status
            </span>
            <Select
              value={order.status}
              disabled={updateOrderStatusMutation.isPending}
              onValueChange={(value) => {
                updateOrderStatusMutation.mutate({
                  orderId,
                  status: value as OrderStatusValue,
                });
              }}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initiated">Initiated</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </HeaderWrapper>

      <PageWrapper className="space-y-6">
        <OrderCustomerDetails order={order} />

        <OrderStatusTracker order={order} />

        <OrderShipmentCard order={order} />

        {order.payment && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <Badge
                    className={getPaymentStatusColor(order.payment.status)}
                  >
                    {order.payment.status.charAt(0).toUpperCase() +
                      order.payment.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Mode</p>
                  <Badge className={getPaymentModeColor(order.payment.mode)}>
                    {order.payment.mode.toUpperCase()}
                  </Badge>
                </div>
                {order.payment.transaction_id && (
                  <div>
                    <p className="text-sm font-medium">Transaction ID</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {order.payment.transaction_id}
                    </p>
                  </div>
                )}
                {order.payment.provider && (
                  <div>
                    <p className="text-sm font-medium">Provider</p>
                    <p className="text-sm text-muted-foreground">
                      {order.payment.provider}
                    </p>
                  </div>
                )}
                {order.payment.paid_at && (
                  <div>
                    <p className="text-sm font-medium">Paid At</p>
                    <p className="text-sm text-muted-foreground">
                      {dayjs(order.payment.paid_at).format(
                        "MMM DD, YYYY HH:mm",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Base Subtotal:</span>
                <span className="text-sm font-medium">
                  ₹{Number(order.pricing.base_subtotal ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Subtotal:</span>
                <span className="text-sm font-medium">
                  ₹{Number(order.pricing.subtotal ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Discount on frame:</span>
                <span className="text-sm font-medium">
                  ₹{Number(order.pricing.discount_on_mrp ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lens Detail Price:</span>
                <span className="text-sm font-medium">
                  ₹{Number(order.pricing.lens_detail_price ?? 0).toFixed(2)}
                </span>
              </div>
              {couponCode || couponDiscount != null ? (
                <div className="flex justify-between">
                  <span className="text-sm">
                    Coupon{couponCode ? ` (${couponCode})` : ""}:
                  </span>
                  <span className="text-sm font-medium">
                    −₹{Number(couponDiscount ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-sm">Shipping Price:</span>
                <span className="text-sm font-medium">
                  ₹{Number(order.pricing.shipping_price ?? 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  ₹{Number(order.pricing.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <OrderItemsDetails items={order.order_items} />
      </PageWrapper>
    </div>
  );
};

export default OrderDetailsPage;
