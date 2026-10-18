"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";
import PrescriptionDetails, {
  type PrescriptionDisplayData,
} from "@/components/cart/PrescriptionDetails";
import { prescriptionSchema } from "@/features/select-lens/purchase.schema";
import type { OrderItem } from "../queries/useGetOrders";

function titleOf(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const t = (raw as Record<string, unknown>).title;
  return typeof t === "string" && t.trim() ? t.trim() : "";
}

function lensIdOf(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const id = (raw as Record<string, unknown>).lens_id;
  return typeof id === "string" && id.trim() ? id.trim() : "";
}

function productMeta(productColor: unknown): {
  modelName: string;
  modelNumber: string;
  thumbnail?: string;
  colorLabel?: string;
  frameSize?: string;
} {
  if (!productColor || typeof productColor !== "object") {
    return { modelName: "", modelNumber: "" };
  }
  const pc = productColor as Record<string, unknown>;
  const modelNumber =
    typeof pc.model_number === "string" ? pc.model_number.trim() : "";
  const product =
    pc.product && typeof pc.product === "object"
      ? (pc.product as Record<string, unknown>)
      : null;
  const modelName =
    product && typeof product.model_name === "string"
      ? product.model_name.trim()
      : "";
  const thumbnail =
    typeof pc.thumbnail === "string" && pc.thumbnail
      ? pc.thumbnail
      : undefined;

  let colorLabel: string | undefined;
  if (Array.isArray(pc.colors) && pc.colors.length) {
    const label = pc.colors
      .map((c) => {
        if (!c || typeof c !== "object") return null;
        const o = c as Record<string, unknown>;
        const name = o.name != null ? String(o.name) : "";
        const color = o.color != null ? String(o.color) : "";
        if (name && color) return `${name}: ${color}`;
        return color || name || null;
      })
      .filter(Boolean)
      .join(", ");
    if (label) colorLabel = label;
  }

  let frameSize: string | undefined;
  if (product) {
    const fw = product.frame_width;
    const fh = product.frame_height;
    const hasW = typeof fw === "number" || typeof fw === "string";
    const hasH = typeof fh === "number" || typeof fh === "string";
    if (hasW && hasH) frameSize = `${fw} × ${fh} mm`;
    else if (hasW) frameSize = `${fw} mm`;
    else if (hasH) frameSize = `${fh} mm`;
  }

  return { modelName, modelNumber, thumbnail, colorLabel, frameSize };
}

function normalizePrescription(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toPrescriptionDisplay(
  raw: unknown,
): PrescriptionDisplayData | null {
  const normalized = normalizePrescription(raw);
  if (!normalized) return null;
  if (normalized.type === "photo" && normalized.image != null) {
    return {
      type: "photo",
      image: normalized.image as string | { url?: string; id?: string },
      comments:
        typeof normalized.comments === "string" ? normalized.comments : "",
    };
  }
  const withComments = {
    ...normalized,
    type: "fillup" as const,
    comments:
      typeof normalized.comments === "string" ? normalized.comments : "",
  };
  const parsed = prescriptionSchema.safeParse(withComments);
  if (!parsed.success || parsed.data.type !== "fillup") return null;
  return parsed.data;
}

function formatInr(n: number | undefined | null) {
  const v = Number(n ?? 0);
  return `₹${v.toFixed(2)}`;
}

interface OrderItemsDetailsProps {
  items: OrderItem[];
}

const OrderItemsDetails: React.FC<OrderItemsDetailsProps> = ({ items }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const meta = productMeta(item.product_color);
            const power = titleOf(item.power_type);
            const lensDetail = titleOf(item.lens_detail);
            const lensFeature = titleOf(item.lens_feature);
            const lensId = lensIdOf(item.lens_detail);
            const prescription = toPrescriptionDisplay(item.prescription);
            const cancelled = Boolean(item.admin_cancelled_at);
            const taxes = item.taxes ?? [];

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 ${cancelled ? "opacity-70" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {meta.thumbnail ? (
                      <Image
                        src={meta.thumbnail}
                        alt={meta.modelName || meta.modelNumber || "Product"}
                        fill
                        className="object-contain"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">
                          {meta.modelName ||
                            meta.modelNumber ||
                            `Item ${index + 1}`}
                        </h4>
                        {meta.modelNumber ? (
                          <p className="text-sm text-muted-foreground">
                            Model / SKU: {meta.modelNumber}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatInr(item.price)}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        {item.discount > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Discount: {formatInr(item.discount)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.frame_only ? (
                        <Badge variant="secondary">Frame only</Badge>
                      ) : null}
                      {cancelled ? (
                        <Badge variant="destructive">Line cancelled</Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                      {meta.colorLabel ? (
                        <p>
                          <span className="text-foreground/80">Colour: </span>
                          {meta.colorLabel}
                        </p>
                      ) : null}
                      {meta.frameSize ? (
                        <p>
                          <span className="text-foreground/80">
                            Frame size:{" "}
                          </span>
                          {meta.frameSize}
                        </p>
                      ) : null}
                      {!item.frame_only && power ? (
                        <p>
                          <span className="text-foreground/80">
                            Power type:{" "}
                          </span>
                          {power}
                        </p>
                      ) : null}
                      {!item.frame_only && lensDetail ? (
                        <p>
                          <span className="text-foreground/80">Lens: </span>
                          {lensDetail}
                        </p>
                      ) : null}
                      {!item.frame_only && lensFeature ? (
                        <p>
                          <span className="text-foreground/80">
                            Lens feature:{" "}
                          </span>
                          {lensFeature}
                        </p>
                      ) : null}
                      {!item.frame_only && lensId ? (
                        <p>
                          <span className="text-foreground/80">Lens ID: </span>
                          {lensId}
                        </p>
                      ) : null}
                    </div>

                    {cancelled && item.cancel_reason ? (
                      <p className="text-sm text-destructive">
                        Cancel reason: {item.cancel_reason}
                      </p>
                    ) : null}

                    {taxes.length > 0 ? (
                      <div className="rounded-md border bg-muted/30 p-2 text-xs">
                        <p className="mb-1 font-medium text-foreground">
                          Taxes
                        </p>
                        <ul className="space-y-0.5 text-muted-foreground">
                          {taxes.map((tax, i) => (
                            <li
                              key={tax.id || `${tax.name}-${i}`}
                              className="flex justify-between gap-2"
                            >
                              <span>
                                {tax.name || tax.tax_type || "Tax"}
                                {tax.tax_rate != null
                                  ? ` (${tax.tax_rate}%)`
                                  : ""}
                              </span>
                              <span>{formatInr(tax.tax_amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {!item.frame_only ? (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-2 text-sm font-medium">
                            Prescription
                          </p>
                          {prescription ? (
                            <PrescriptionDetails data={prescription} />
                          ) : item.prescription ? (
                            <pre className="max-h-40 overflow-auto rounded border bg-muted/40 p-2 text-[10px] leading-relaxed">
                              {typeof item.prescription === "string"
                                ? item.prescription
                                : JSON.stringify(item.prescription, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No prescription on this line.
                            </p>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsDetails;
