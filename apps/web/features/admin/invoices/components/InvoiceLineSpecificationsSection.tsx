"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Invoice, InvoiceItem } from "@/features/admin/invoices/queries/useGetInvoice";
import PrescriptionDetails, {
  type PrescriptionDisplayData,
} from "@/components/cart/PrescriptionDetails";
import { prescriptionSchema } from "@/features/select-lens/purchase.schema";
import InvoiceHeader from "./invoice-header";

/** Normalize stored prescription: stringified JSON → object. */
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

function toFillupDisplayData(
  normalized: Record<string, unknown>,
): PrescriptionDisplayData | null {
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

function toPhotoDisplayData(
  normalized: Record<string, unknown>,
): PrescriptionDisplayData | null {
  if (normalized.type !== "photo" || normalized.image == null) return null;
  return {
    type: "photo",
    image: normalized.image as string | { url?: string; id?: string },
    comments:
      typeof normalized.comments === "string" ? normalized.comments : "",
  };
}

/** `LensDetail.lens_id` from the snapshot on the invoice line (not Mongo `id`). */
function lensDetailLensIdFromItem(item: InvoiceItem): string | undefined {
  const ld = item.lens_detail;
  if (!ld || typeof ld !== "object") return undefined;
  const lens_id = (ld as Record<string, unknown>).lens_id;
  if (typeof lens_id === "string" && lens_id.trim()) return lens_id.trim();
  return undefined;
}

/** Power type, lens detail, and lens feature titles only (no DB ids). */
function lensConfigurationTitles(item: InvoiceItem): string[] {
  if (item.frame_only) return [];
  const titles: string[] = [];
  for (const raw of [item.power_type, item.lens_detail, item.lens_feature]) {
    const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const t =
      typeof o.title === "string" && o.title.trim() ? o.title.trim() : "";
    if (t) titles.push(t);
  }
  return titles;
}

function formatProductColorNotes(productColor: unknown): {
  lines: string[];
  frameModelNumber?: string;
} {
  if (!productColor || typeof productColor !== "object")
    return { lines: [] };
  const pc = productColor as Record<string, unknown>;
  const lines: string[] = [];

  const colors = pc.colors;
  if (Array.isArray(colors) && colors.length) {
    const label = colors
      .map((c) => {
        if (!c || typeof c !== "object") return null;
        const o = c as Record<string, unknown>;
        const name = o.name != null ? String(o.name) : "";
        const color = o.color != null ? String(o.color) : "";
        if (name && color) return `${name}: ${color}`;
        if (color) return color;
        if (name) return name;
        return null;
      })
      .filter(Boolean)
      .join(", ");
    if (label) lines.push(`Colour: ${label}`);
  }

  const product = pc.product;
  if (product && typeof product === "object") {
    const p = product as Record<string, unknown>;
    const fw = p.frame_width;
    const fh = p.frame_height;
    const hasW = typeof fw === "number" || typeof fw === "string";
    const hasH = typeof fh === "number" || typeof fh === "string";
    if (hasW && hasH) {
      lines.push(`Frame size: ${fw} × ${fh} mm`);
    } else if (hasW) {
      lines.push(`Frame size: ${fw} mm`);
    } else if (hasH) {
      lines.push(`Frame size: ${fh} mm`);
    }
  }

  let frameModelNumber: string | undefined;
  if (typeof pc.model_number === "string" && pc.model_number.trim()) {
    frameModelNumber = pc.model_number.trim();
  }

  return { lines, frameModelNumber };
}

function UnstructuredPrescriptionFallback({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;
  try {
    const text =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    return (
      <pre className="mt-2 max-h-40 overflow-auto rounded border bg-muted/40 p-2 text-[10px] leading-relaxed">
        {text}
      </pre>
    );
  } catch {
    return (
      <p className="text-xs text-muted-foreground mt-2">
        Prescription on file (could not display).
      </p>
    );
  }
}

export interface InvoiceLineSpecificationsSectionProps {
  /** Full invoice number (e.g. AKC/24-25/01); repeated in print header on each page. */
  invoiceNumber: string;
  invoiceItems: InvoiceItem[];
  /** order_item_id → prescription JSON from OrderItem */
  prescriptionByOrderItemId: Record<string, unknown | null | undefined>;
  orderLoading: boolean;
  orderError: boolean;
  invoice: Invoice;
  activeInvoiceItems: InvoiceItem[];
}

const InvoiceLineSpecificationsSection: React.FC<
  InvoiceLineSpecificationsSectionProps
> = ({
  invoiceNumber,
  invoiceItems,
  prescriptionByOrderItemId,
  orderLoading,
  orderError,
  invoice,
  activeInvoiceItems,
}) => {
    const invoiceSequence =
      typeof invoiceNumber === "string"
        ? invoiceNumber.split("/")[2]?.trim() ?? ""
        : "";

    return (
      <div className="p-2.5 sm:p-3">
        <table className="w-full border-collapse text-[9px] leading-tight">
          <thead className="print:table-header-group">
            <tr className="border-b">
              <InvoiceHeader invoiceNumber={invoiceNumber} invoice={invoice} activeInvoiceItems={activeInvoiceItems} isLineSpecifications />
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 text-[8px] text-muted-foreground">
                Configuration and prescription per line. Prices and taxes are on
                page 1 only.
              </td>
            </tr>
            {(orderLoading || orderError) && (
              <tr className="border-b">
                <td className="py-1.5 text-[8px] text-muted-foreground">
                  {orderLoading && "Loading order data for prescriptions…"}
                  {orderError &&
                    !orderLoading &&
                    "Order data could not be loaded; prescriptions may be missing."}
                </td>
              </tr>
            )}
            {invoiceItems.map((item, index) => {
              const isCancelled = !!item.cancelled_at;
              const lensTitles = lensConfigurationTitles(item);
              const lensDetailLensId = lensDetailLensIdFromItem(item);
              const { lines: colorLines, frameModelNumber } = formatProductColorNotes(
                item.product_color,
              );
              const rxRaw = item.order_item_id
                ? prescriptionByOrderItemId[item.order_item_id]
                : undefined;
              const normalizedRx =
                rxRaw !== undefined && rxRaw !== null
                  ? normalizePrescription(rxRaw)
                  : null;
              const photoRx =
                normalizedRx?.type === "photo"
                  ? toPhotoDisplayData(normalizedRx)
                  : null;
              const fillupRx =
                normalizedRx?.type === "fillup"
                  ? toFillupDisplayData(normalizedRx)
                  : null;
              const knownRx = photoRx ?? fillupRx;
              const showUnstructuredFallback =
                rxRaw != null &&
                !orderLoading &&
                item.order_item_id &&
                !knownRx;

              return (
                <tr key={item.id} className="border-b align-top">
                  <td className="py-2 print:py-1.5">
                    <div
                      className={cn(
                        "break-inside-avoid rounded border p-2 text-[8px] print:break-inside-auto",
                        isCancelled && "bg-muted/20 opacity-80",
                      )}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-1">
                        <span className="text-muted-foreground">Line {index + 1}</span>
                        <span
                          className={cn(
                            "font-medium",
                            isCancelled && "line-through",
                          )}
                        >
                          {item.product_name}
                        </span>
                        {isCancelled && (
                          <Badge variant="secondary" className="h-3.5 px-1 text-[7px]">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                      <dl className="grid gap-0.5 text-gray-700 sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">SKU</dt>
                          <dd>{item.product_sku || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Quantity</dt>
                          <dd>{item.quantity}</dd>
                        </div>
                      </dl>
                      {(colorLines.length > 0 || frameModelNumber) && (
                        <ul className="mt-1 list-disc space-y-0 pl-3.5 text-gray-700">
                          {colorLines.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                          {frameModelNumber && (
                            <li>
                              <span className="text-muted-foreground">
                                Frame model no.:{" "}
                              </span>
                              <span className="font-semibold text-foreground">
                                {frameModelNumber}
                              </span>
                            </li>
                          )}
                        </ul>
                      )}
                      {item.frame_only ? (
                        <p className="mt-1 text-muted-foreground">
                          Frame only — no lens configuration.
                        </p>
                      ) : (
                        <>
                          {lensTitles.length > 0 && (
                            <p className="mt-1 text-gray-700">
                              <span className="text-muted-foreground">Lens: </span>
                              {lensTitles.join(" · ")}
                              {lensDetailLensId && (
                                <>
                                  {" "}
                                  <span className="text-muted-foreground">Lens id: </span>
                                  <span className="font-semibold text-foreground">
                                    {lensDetailLensId}
                                  </span>
                                </>
                              )}
                            </p>
                          )}
                          <div className="mt-1.5 overflow-hidden rounded border">
                            {!item.frame_only && item.order_item_id && orderLoading && (
                              <p className="p-2 text-muted-foreground">
                                Loading prescription…
                              </p>
                            )}
                            {!item.frame_only && !item.order_item_id && (
                              <p className="p-2 text-muted-foreground">
                                Prescription not linked (legacy line).
                              </p>
                            )}
                            {!item.frame_only &&
                              item.order_item_id &&
                              !orderLoading &&
                              (rxRaw === null || rxRaw === undefined) && (
                                <p className="p-2 text-muted-foreground">
                                  No prescription on file for this line.
                                </p>
                              )}
                            {!item.frame_only &&
                              item.order_item_id &&
                              !orderLoading &&
                              knownRx && (
                                <div className="max-h-36 overflow-auto">
                                  <PrescriptionDetails data={knownRx} />
                                </div>
                              )}
                            {showUnstructuredFallback && (
                              <div className="p-2">
                                <p className="text-muted-foreground">
                                  Prescription on file (unstructured or legacy format).
                                </p>
                                <UnstructuredPrescriptionFallback data={rxRaw} />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

export default InvoiceLineSpecificationsSection;
