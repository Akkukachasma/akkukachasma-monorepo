import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  Home,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";
import { Order } from "../queries/useGetOrder";
import dayjs from "dayjs";
import useShipmentLive from "../queries/useShipmentLive";
import { extractDelhiveryScans } from "../utils/extract-delhivery-scans";

interface OrderStatusTrackerProps {
  order: Order;
}

interface StatusStep {
  key: string;
  title: string;
  description: string;
  adminAction?: string;
  icon: React.ReactNode;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
  requiresAction?: boolean;
}

/** Map Delhivery scans to picked_at and delivered_at timestamps */
function mapDelhiveryScansToStatus(scans: { Scan?: string; ScanDetail?: { ScannedAt?: string }; DetailedStatus?: { Status?: string } }[]): {
  picked_at?: string;
  delivered_at?: string;
  derivedStatus: "initiated" | "confirmed" | "picked" | "delivered";
} {
  if (!scans?.length) {
    return { derivedStatus: "confirmed" };
  }

  let picked_at: string | undefined;
  let delivered_at: string | undefined;

  const sorted = [...scans].sort((a, b) => {
    const atA = a.ScanDetail?.ScannedAt ?? "";
    const atB = b.ScanDetail?.ScannedAt ?? "";
    return atA.localeCompare(atB);
  });

  for (const scan of sorted) {
    const text = (
      (scan.Scan ?? "") +
      " " +
      (scan.DetailedStatus?.Status ?? "")
    ).toLowerCase();
    const scannedAt = scan.ScanDetail?.ScannedAt;

    if (scannedAt) {
      if (
        !delivered_at &&
        (text.includes("delivered") || text.trim() === "dl" || /\bdl\b/.test(text))
      ) {
        delivered_at = scannedAt;
      } else if (
        !picked_at &&
        (text.includes("pickup") ||
          text.includes("picked") ||
          text.includes("collected") ||
          text.includes("dispatched") ||
          text.includes("transit"))
      ) {
        picked_at = scannedAt;
      }
    }
  }

  let derivedStatus: "initiated" | "confirmed" | "picked" | "delivered" =
    "confirmed";
  if (delivered_at) derivedStatus = "delivered";
  else if (picked_at) derivedStatus = "picked";

  return { picked_at, delivered_at, derivedStatus };
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order }) => {
  const waybill = order.shipment_details?.waybill_number;
  const { data: shipmentLive, isLoading } = useShipmentLive(
    order.id,
    waybill ?? null
  );

  const scans = extractDelhiveryScans(shipmentLive?.tracking_info);
  const { picked_at, delivered_at, derivedStatus } = mapDelhiveryScansToStatus(
    scans
  );

  const getStatusSteps = (): StatusStep[] => {
    // Always respect our DB: cancelled takes precedence over Delhivery
    const status =
      order.status === "cancelled"
        ? "cancelled"
        : waybill
          ? derivedStatus
          : order.status;
    if (status === "cancelled") {
      return [
        {
          key: "initiated",
          title: "Order Initiated",
          description: "Customer has started the checkout process",
          icon: <User className="h-5 w-5" />,
          timestamp: order.created_at,
          isCompleted: true,
          isActive: false,
        },
        {
          key: "cancelled",
          title: "Order Cancelled",
          description: "Order has been cancelled",
          adminAction: "Process refund if applicable",
          icon: <AlertCircle className="h-5 w-5" />,
          timestamp: order.cancelled_at,
          isCompleted: true,
          isActive: true,
          requiresAction: false,
        },
      ];
    }

    const steps: StatusStep[] = [
      {
        key: "initiated",
        title: "Order Initiated",
        description: "Customer has started the checkout process",
        adminAction: "Review order details and confirm",
        icon: <User className="h-5 w-5" />,
        timestamp: order.created_at,
        isCompleted: true,
        isActive: status === "initiated",
        requiresAction: status === "initiated",
      },
      {
        key: "confirmed",
        title: "Order Confirmed",
        description: "Order has been confirmed",
        adminAction: "Prepare items for pickup",
        icon: <CheckCircle className="h-5 w-5" />,
        timestamp: order.confirmed_at,
        isCompleted: ["confirmed", "picked", "delivered"].includes(status),
        isActive: status === "confirmed",
        requiresAction: status === "confirmed",
      },
      {
        key: "picked",
        title: "Out for Delivery",
        description: "Package has been picked up by delivery partner",
        adminAction: "Track delivery progress",
        icon: <Truck className="h-5 w-5" />,
        timestamp: picked_at ?? order.picked_at,
        isCompleted: ["picked", "delivered"].includes(status),
        isActive: status === "picked",
        requiresAction: status === "picked",
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "Package has been successfully delivered",
        adminAction: "Order completed",
        icon: <Home className="h-5 w-5" />,
        timestamp: delivered_at ?? order.delivered_at,
        isCompleted: status === "delivered",
        isActive: status === "delivered",
        requiresAction: false,
      },
    ];
    return steps;
  };

  const steps = getStatusSteps();
  const displayStatus = waybill ? derivedStatus : order.status;
  const currentStep = steps.find((s) => s.isActive) || steps[0];

  if (order.status === "cancelled") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Status Management
            </div>
            <Badge variant="destructive" className="text-xs">
              CANCELLED
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {steps.map((step, index) => (
              <div key={step.key} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-6 top-8 w-0.5 h-16 ${
                      step.isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
                <div className="flex items-start space-x-4 pb-6">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : step.isActive
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.timestamp && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {dayjs(step.timestamp).format("DD MMM YYYY HH:mm A")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status Management
          </div>
          <Badge variant="secondary" className="text-xs">
            {displayStatus.toUpperCase()}
            {waybill && !isLoading && " (Live)"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Status Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Current Status</h4>
            <Badge variant="outline" className="text-xs">
              {currentStep.requiresAction
                ? "Action Required"
                : "No Action Needed"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {currentStep.adminAction}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Order ID: {order.id}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Customer: {order.user.name}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.key} className="relative">
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-8 w-0.5 h-16 ${
                    step.isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
              <div className="flex items-start space-x-4 pb-6">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    step.isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : step.isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium ${
                        step.isCompleted || step.isActive
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {step.requiresAction && step.isActive && (
                      <Badge variant="destructive" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-sm mb-2 ${
                      step.isCompleted || step.isActive
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </p>
                  {step.adminAction && (
                    <p
                      className={`text-xs mb-2 ${
                        step.isActive && step.requiresAction
                          ? "text-blue-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="font-medium">Admin Action:</span>{" "}
                      {step.adminAction}
                    </p>
                  )}
                  {step.timestamp && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {dayjs(step.timestamp).format("DD MMM YYYY HH:mm A")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Notes Section */}
        <div className="mt-6 space-y-3">
          {order.notes && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Package className="h-4 w-4" />
                <span className="font-medium">Order Notes</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTracker;
