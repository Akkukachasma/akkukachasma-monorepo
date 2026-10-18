"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, ExternalLink, RefreshCw } from "lucide-react";
import { Order } from "../queries/useGetOrder";
import useShipmentLive from "../queries/useShipmentLive";
import useManifestOrders from "../mutations/useManifestOrders";
import { isOrderManifestSelectable } from "../utils/manifest-eligibility";
import { extractDelhiveryScans } from "../utils/extract-delhivery-scans";
import { ManifestProgressPanel } from "./ManifestProgressPanel";
import dayjs from "dayjs";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrderShipmentCardProps {
  order: Order;
}

const OrderShipmentCard: React.FC<OrderShipmentCardProps> = ({ order }) => {
  const sd = order.shipment_details;
  const waybill = sd?.waybill_number;
  const canManifest = isOrderManifestSelectable(order);
  const manifestOrders = useManifestOrders();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data: shipmentLive,
    refetch,
    isRefetching,
  } = useShipmentLive(order.id, waybill ?? null);

  const scans = extractDelhiveryScans(shipmentLive?.tracking_info);

  const handleRefreshTracking = () => {
    if (!waybill) {
      toast({
        title: "No Shipment",
        description:
          "Use Ready To Ship to create a Delhivery shipment for this order.",
        variant: "destructive",
      });
      return;
    }
    refetch()
      .then(() => {
        toast({
          title: "Tracking Updated",
          description: "Shipment tracking information has been refreshed.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch live tracking. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleManifest = async () => {
    try {
      await manifestOrders.mutateAsync([order.id]);
      toast({
        title: "Ready To Ship started",
        description: "Manifest progress will update below.",
      });
      setConfirmOpen(false);
    } catch {
      // toast in mutation
    }
  };

  if (!waybill) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipment & Tracking
            </span>
            {canManifest ? (
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={manifestOrders.isPending}
              >
                <Truck className="mr-2 h-4 w-4" />
                Ready To Ship
              </Button>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {canManifest
              ? "No Delhivery waybill yet. Click Ready To Ship to manifest this order."
              : "Shipment is not available until the order is confirmed (or picked) and has a shipping address."}
          </p>
          <ManifestProgressPanel />
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ready To Ship?</AlertDialogTitle>
                <AlertDialogDescription>
                  Create a Delhivery shipment for this order and assign an AWB.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    void handleManifest();
                  }}
                  disabled={manifestOrders.isPending}
                >
                  {manifestOrders.isPending ? "Starting…" : "Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipment & Tracking
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshTracking}
            disabled={isRefetching}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")}
            />
            Refresh Tracking
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Waybill:</span>
            <span className="text-sm font-mono">{waybill}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Delivery Partner:</span>
            <span className="text-sm">
              {sd?.delivery_partner ?? "Delhivery"}
            </span>
          </div>
          {sd?.estimated_delivery && (
            <p className="text-sm text-muted-foreground">
              Estimated delivery:{" "}
              {dayjs(sd.estimated_delivery).format("DD MMM YYYY")}
            </p>
          )}
          <div className="flex gap-2">
            {sd?.tracking_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={sd.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track on Delhivery
                </a>
              </Button>
            )}
          </div>
        </div>

        {scans.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium">Recent Scans</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-1 p-2 rounded bg-muted/50 text-sm"
                >
                  <span className="font-medium">
                    {scan.Scan ?? scan.DetailedStatus?.Status ?? "—"}
                  </span>
                  {scan.ScanDetail?.ScannedAt && (
                    <span className="text-xs text-muted-foreground">
                      {dayjs(scan.ScanDetail.ScannedAt).format(
                        "DD MMM YYYY HH:mm",
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderShipmentCard;
