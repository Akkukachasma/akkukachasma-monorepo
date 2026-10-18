"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, User, ExternalLink, Search } from "lucide-react";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import dayjs from "dayjs";
import { extractDelhiveryScans } from "@/features/admin/orders/utils/extract-delhivery-scans";

export default function TrackOrderClient() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    if (id) setOrderId(id);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    order_id: string;
    status: string;
    created_at?: string;
    confirmed_at?: string;
    picked_at?: string;
    delivered_at?: string;
    shipment?: {
      waybill_number: string;
      tracking_url: string;
      delivery_partner: string;
      estimated_delivery?: string;
      actual_delivery?: string;
    };
    tracking_info?: {
      AWB?: string;
      Scans?: Array<{
        Scan?: string;
        ScanDetail?: { ScannedAt?: string; Instruction?: string };
      }>;
    } | null;
    address?: { address: string; city: string; state: string; zip_code: string };
    customer_name?: string;
  } | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const api = getApiClient();
      const res = await api.get(ENDPOINTS.orders.track(orderId.trim()));
      setData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Order not found. Please check the order ID.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const scans = extractDelhiveryScans(data?.tracking_info).slice().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="app-container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order ID to see delivery status and tracking details
            </p>
          </div>

          <form onSubmit={handleTrack} className="mb-8">
            <div className="flex gap-2">
              <Input
                placeholder="Enter order ID (e.g. 68a3b6f7725408f429688e17)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Searching..."
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Order #{data.order_id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <Badge className={getStatusColor(data.status)}>
                      {data.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.customer_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{data.customer_name}</span>
                    </div>
                  )}
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    {data.confirmed_at && (
                      <p>Confirmed: {dayjs(data.confirmed_at).format("DD MMM YYYY, hh:mm A")}</p>
                    )}
                    {data.picked_at && (
                      <p>Out for delivery: {dayjs(data.picked_at).format("DD MMM YYYY")}</p>
                    )}
                    {data.delivered_at && (
                      <p>Delivered: {dayjs(data.delivered_at).format("DD MMM YYYY")}</p>
                    )}
                  </div>
                  {data.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p>{data.address.address}</p>
                        <p>
                          {data.address.city}, {data.address.state} -{" "}
                          {data.address.zip_code}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {data.shipment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Truck className="h-5 w-5" />
                      Shipment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">Waybill:</span>
                      <span className="text-sm font-mono">{data.shipment.waybill_number}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">Delivery Partner:</span>
                      <span className="text-sm">{data.shipment.delivery_partner}</span>
                    </div>
                    {data.shipment.estimated_delivery && (
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery:{" "}
                        {dayjs(data.shipment.estimated_delivery).format("DD MMM YYYY")}
                      </p>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={data.shipment.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Track on Delhivery
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {scans.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Tracking Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-4">
                      {scans.map((scan, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            {idx < scans.length - 1 && (
                              <div className="w-0.5 flex-1 min-h-[24px] bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium">{scan.Scan || "Update"}</p>
                            {scan.ScanDetail?.ScannedAt && (
                              <p className="text-xs text-muted-foreground">
                                {dayjs(scan.ScanDetail.ScannedAt).format(
                                  "DD MMM YYYY, hh:mm A"
                                )}
                              </p>
                            )}
                            {scan.ScanDetail?.Instruction && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {scan.ScanDetail.Instruction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
