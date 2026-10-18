import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Eye,
  IndianRupee,
} from "lucide-react";
import { Order } from "../queries/useGetOrders";
import dayjs from "dayjs";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "picked":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseIcon>
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={order.user.avatar}
                      alt={order.user.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {order.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{order.user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                  {order.payment && (
                    <>
                      <Badge
                        className={getPaymentStatusColor(order.payment.status)}
                      >
                        {order.payment.status.charAt(0).toUpperCase() +
                          order.payment.status.slice(1)}
                      </Badge>
                      <Badge
                        className={getPaymentModeColor(order.payment.mode)}
                      >
                        {order.payment.mode.toUpperCase()}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Order Date</p>
                  <p className="text-sm text-muted-foreground">
                    {dayjs(order.created_at).format("MMM DD, YYYY HH:mm")}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">City</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">State</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">ZIP Code</p>
                    <p className="text-sm text-muted-foreground">
                      {order.address.zip_code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Information */}
          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                      <p className="text-sm text-muted-foreground">
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

          {/* Pricing Information */}
          <Card>
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
                    ₹{order.pricing.base_subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm font-medium">
                    ₹{order.pricing.subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discount on frame:</span>
                  <span className="text-sm font-medium">
                    ₹{order.pricing.discount_on_mrp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lens Detail Price:</span>
                  <span className="text-sm font-medium">
                    ₹{order.pricing.lens_detail_price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping Price:</span>
                  <span className="text-sm font-medium">
                    ₹{order.pricing.shipping_price}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">₹{order.pricing.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.order_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item, index) => {
                  const lineCancelled = !!(item as { admin_cancelled_at?: string })
                    .admin_cancelled_at;
                  return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 ${lineCancelled ? "opacity-70 bg-muted/30" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-medium ${lineCancelled ? "line-through" : ""}`}
                          >
                            {item.product_color?.model_number ||
                              `Item ${index + 1}`}
                          </h4>
                          {lineCancelled && (
                            <Badge variant="outline" className="text-[10px]">
                              Line cancelled (invoice)
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        {item.frame_only && (
                          <Badge variant="secondary" className="mt-1">
                            Frame Only
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price}</p>
                        {item.discount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Discount: ₹{item.discount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
