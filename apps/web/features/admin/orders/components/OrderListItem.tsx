import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Calendar, CircleAlert, Phone } from "lucide-react";
import { Order } from "../queries/useGetOrders";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatIndianPhone } from "@/lib/format-indian-phone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isOrderExportSelectable } from "../utils/export-eligibility";
import { isOrderManifestSelectable } from "../utils/manifest-eligibility";

interface OrderListItemProps {
  order: Order | null;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  /** When true (e.g. user has started multi-select), warn on rows with no invoice yet. */
  selectionActive?: boolean;
}

const OrderListItem: React.FC<OrderListItemProps> = ({
  order,
  selected = false,
  onSelectChange,
  selectionActive = false,
}) => {
  const router = useRouter();

  if (!order) {
    return (
      <tr className="animate-pulse">
        <td className="w-12">
          <div className="mx-auto h-4 w-4 rounded-sm bg-muted" />
        </td>
        <td>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-1">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          </div>
        </td>
        <td>
          <div className="h-4 w-24 rounded bg-muted" />
        </td>
        <td>
          <div className="h-6 w-16 rounded bg-muted" />
        </td>
        <td>
          <div className="h-6 w-16 rounded bg-muted" />
        </td>
        <td>
          <div className="h-4 w-16 rounded bg-muted" />
        </td>
        <td>
          <div className="h-4 w-12 rounded bg-muted" />
        </td>
        <td>
          <div className="h-4 w-20 rounded bg-muted" />
        </td>
      </tr>
    );
  }

  const orderRefLabel =
    order.invoice?.invoice_number?.trim() || order.id;
  const phoneDisplay = formatIndianPhone(order.user.phone_number);

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
        return "!bg-green-100 !text-green-800";
      case "pending":
        return "!bg-yellow-100 !text-yellow-800";
      case "failed":
        return "!bg-red-100 !text-red-800";
      default:
        return "!bg-gray-100 !text-gray-800";
    }
  };

  const getPaymentModeColor = (mode?: string) => {
    switch (mode) {
      case "online":
        return "!bg-blue-100 !text-blue-800";
      case "cod":
        return "!bg-orange-100 !text-orange-800";
      default:
        return "!bg-gray-100 !text-gray-800";
    }
  };

  const handleRowClick = () => {
    router.push(`/manage/orders/${order.id}`);
  };

  const bulkSelectable = isOrderExportSelectable(order) || isOrderManifestSelectable(order);
  const checkboxDisabledReason = !bulkSelectable
    ? "Not eligible for export or Ready To Ship."
    : null;

  const showInvoiceWarning =
    selectionActive &&
    (!order.invoice?.id || order.invoice.status === "void");
  const invoiceWarningMessage = !order.invoice?.id
    ? "Invoice has not been generated for this order yet."
    : "This order’s invoice is void.";

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={handleRowClick}
    >
      <td
        className="w-12"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          {!bulkSelectable && checkboxDisabledReason ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex cursor-not-allowed rounded-md"
                  tabIndex={0}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={false}
                    disabled
                    className="pointer-events-none"
                    aria-label={checkboxDisabledReason}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px] text-left">
                {checkboxDisabledReason}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onSelectChange?.(checked === true)
              }
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select order ${order.order_id ?? order.id}`}
            />
          )}
        </div>
      </td>

      <td>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center space-x-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={order.user.avatar} alt={order.user.name} />
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {order.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{order.user.name}</p>
              <p
                className="truncate text-xs text-muted-foreground tabular-nums"
                title={orderRefLabel}
              >
                {orderRefLabel}
              </p>
            </div>
          </div>
          {showInvoiceWarning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-600 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={invoiceWarningMessage}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <CircleAlert className="h-4 w-4" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-left">
                {invoiceWarningMessage}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </td>

      <td>
        <div className="flex min-w-0 items-center space-x-1">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span
            className="truncate text-sm tabular-nums"
            title={phoneDisplay ?? undefined}
          >
            {phoneDisplay ?? "—"}
          </span>
        </div>
      </td>

      <td>
        <div className="space-y-1">
          <Badge className={cn(getStatusColor(order.status))}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </td>

      <td>
        <div className="space-x-1">
          {order.payment && (
            <>
              <Badge className={getPaymentStatusColor(order.payment.status)}>
                {order.payment.status.charAt(0).toUpperCase() +
                  order.payment.status.slice(1)}
              </Badge>
              <Badge className={getPaymentModeColor(order.payment.mode)}>
                {order.payment.mode.toUpperCase()}
              </Badge>
            </>
          )}
        </div>
      </td>

      <td>
        <p className="text-sm font-semibold">
          ₹{order.pricing.total?.toFixed(2)}
        </p>
      </td>

      <td>
        <div className="flex items-center space-x-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{order.order_items.length}</span>
        </div>
      </td>

      <td>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {dayjs(order.created_at).format("MMM DD, YYYY")}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default OrderListItem;
