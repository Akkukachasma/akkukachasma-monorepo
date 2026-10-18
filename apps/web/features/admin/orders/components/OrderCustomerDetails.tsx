"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Mail, Phone, Hash } from "lucide-react";
import dayjs from "dayjs";
import type { Order } from "../queries/useGetOrder";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 text-sm sm:grid-cols-[8.5rem_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

interface OrderCustomerDetailsProps {
  order: Order;
}

const OrderCustomerDetails: React.FC<OrderCustomerDetailsProps> = ({
  order,
}) => {
  const phone = order.user.phone_number?.trim();
  const email = order.user.email?.trim();
  const address = order.address;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={order.user.avatar} alt={order.user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {order.user.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{order.user.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                User ID: {order.user.id}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {phone ? (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            ) : null}
            {email ? (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a href={`mailto:${email}`} className="truncate hover:underline">
                  {email}
                </a>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t pt-3">
            <DetailRow label="Order ID" value={order.id} />
            {order.order_id ? (
              <DetailRow
                label="Payment order"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    {order.order_id}
                  </span>
                }
              />
            ) : null}
            {order.source ? (
              <DetailRow
                label="Source"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {order.source}
                  </Badge>
                }
              />
            ) : null}
            {order.invoice?.invoice_number ? (
              <DetailRow
                label="Invoice"
                value={
                  <span>
                    {order.invoice.invoice_number}
                    <Badge variant="outline" className="ml-2 capitalize">
                      {order.invoice.status}
                    </Badge>
                  </span>
                }
              />
            ) : null}
            <DetailRow
              label="Placed"
              value={dayjs(order.created_at).format("MMM DD, YYYY HH:mm")}
            />
            <DetailRow
              label="Updated"
              value={dayjs(order.updated_at).format("MMM DD, YYYY HH:mm")}
            />
            {order.confirmed_at ? (
              <DetailRow
                label="Confirmed"
                value={dayjs(order.confirmed_at).format("MMM DD, YYYY HH:mm")}
              />
            ) : null}
            {order.picked_at ? (
              <DetailRow
                label="Picked"
                value={dayjs(order.picked_at).format("MMM DD, YYYY HH:mm")}
              />
            ) : null}
            {order.delivered_at ? (
              <DetailRow
                label="Delivered"
                value={dayjs(order.delivered_at).format("MMM DD, YYYY HH:mm")}
              />
            ) : null}
            {order.cancelled_at ? (
              <DetailRow
                label="Cancelled"
                value={dayjs(order.cancelled_at).format("MMM DD, YYYY HH:mm")}
              />
            ) : null}
            {order.notes ? (
              <DetailRow label="Notes" value={order.notes} />
            ) : null}
          </div>
        </CardContent>
      </Card>

      {address ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {address.label ? (
              <DetailRow
                label="Label"
                value={
                  <Badge variant="outline" className="capitalize">
                    {address.label}
                  </Badge>
                }
              />
            ) : null}
            <DetailRow label="Street" value={address.address} />
            <DetailRow label="City" value={address.city} />
            <DetailRow label="State" value={address.state} />
            <DetailRow label="PIN" value={address.zip_code} />
            <DetailRow label="Country" value={address.country || "India"} />
            {address.notes ? (
              <DetailRow label="Notes" value={address.notes} />
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No address on file.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderCustomerDetails;
