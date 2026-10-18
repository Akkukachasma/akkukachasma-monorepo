"use client";

import React, { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatIndianPhone } from "@/lib/format-indian-phone";
import { splitLineGstIntoCgstSgstForDisplay } from "@/lib/gst-display";
import { formatGstRoundedByPaise } from "@/lib/order-summary-gst";
import { signatureDataUrl } from "@/features/admin/company-info/utils/signatureDataUrl";
import type {
  CompanyInfo,
  Invoice,
  InvoiceItemTax,
} from "@/features/admin/invoices/queries/useGetInvoice";
import InvoiceHeader from "@/features/admin/invoices/components/invoice-header";
import InvoiceLineSpecificationsSection from "@/features/admin/invoices/components/InvoiceLineSpecificationsSection";

export type InvoiceDocumentProps = {
  invoice: Invoice;
  company_info: CompanyInfo | null | undefined;
  prescriptionByOrderItemId: Record<string, unknown | null | undefined>;
  orderLoading?: boolean;
  orderError?: boolean;
  /** When false, hide line cancel controls (bulk / PDF-only mounts). Default true. */
  interactive?: boolean;
  onCancelLine?: (itemId: string) => void;
};

function formatCurrency(amount: number) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function aggregateLineTaxes(taxes: InvoiceItemTax[]) {
  let gst = 0;
  let igst = 0;
  let other = 0;
  let rate = 0;
  for (const t of taxes || []) {
    const a = Number(t.tax_amount || 0);
    const typ = String(t.tax_type || "").toUpperCase();
    if (typ === "GST") {
      gst += a;
      rate = Number(t.tax_rate) || rate;
    } else if (typ === "IGST") igst += a;
    else other += a;
  }
  return { gst, igst, other, rate };
}

function totalLineTaxAmount(taxes: InvoiceItemTax[]) {
  return (taxes || []).reduce((s, t) => s + Number(t.tax_amount || 0), 0);
}

/**
 * Printable / PDF-serializable invoice body (A5 sheets).
 * Shared by the admin invoice page and bulk offscreen PDF rendering.
 */
const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  function InvoiceDocument(
    {
      invoice,
      company_info,
      prescriptionByOrderItemId,
      orderLoading = false,
      orderError = false,
      interactive = true,
      onCancelLine,
    },
    ref,
  ) {
    const invoiceNumber = invoice.invoice_number;
    const companySignatureSrc = signatureDataUrl(company_info?.signature);
    const gstSummary = invoice.gst_summary;
    const activeInvoiceItems = invoice.invoice_items.filter(
      (i) => !i.cancelled_at,
    );
    const canCancelAnyLine =
      interactive &&
      invoice.status !== "void" &&
      activeInvoiceItems.length > 1;

    const taxableAmountExGst = activeInvoiceItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.total_amount ?? 0) -
          totalLineTaxAmount(item.taxes || [])),
      0,
    );

    const customerPhone = formatIndianPhone(
      invoice.order.user.phone_number ?? null,
    );

    const isInvoiceVoid = invoice.status === "void";
    const voidPageOverlay = isInvoiceVoid ? (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center print:z-[100]"
      >
        <div className="rounded-xl border-4 border-red-600 px-8 py-5 opacity-[0.45] shadow-sm sm:px-12 sm:py-8 -rotate-[45deg] scale-125">
          <p className="text-center text-5xl font-black uppercase tracking-[0.2em] text-red-600 sm:text-7xl print:text-[4.5rem]">
            VOID
          </p>
        </div>
      </div>
    ) : null;

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[148mm] space-y-4 text-[10px] leading-snug"
      >
        {/* Page 1: tax invoice body — sized for A5 (148×210mm) */}
        <div className="invoice-a5-sheet relative break-after-page overflow-hidden rounded-md border bg-white shadow-sm print:break-after-page print:shadow-none">
          <div className="invoice-pdf-export-show hidden border-b bg-white px-3 py-1.5 text-center text-[10px] print:block">
            <span className="font-semibold tracking-tight">Tax invoice</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span className="font-bold tabular-nums">{invoiceNumber}</span>
          </div>
          <InvoiceHeader
            invoiceNumber={invoiceNumber || ""}
            invoice={invoice}
            activeInvoiceItems={activeInvoiceItems}
          />

          <div className="border-b px-3 py-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="mb-1 text-[10px] font-semibold">Bill From</h3>
                <div className="space-y-0.5 text-[9px] leading-tight">
                  <p>
                    {company_info?.store_address ||
                      "Akku Ka Chasma (GROUND FLOOR)"}
                  </p>
                  <p>
                    {company_info?.full_address ||
                      "Jeevanbhima Nagar Main Road (29) - 560075"}
                  </p>
                  <p>
                    <span className="font-bold">GSTIN:</span>{" "}
                    {company_info?.gstin || "06AADCD9571D1ZO"}
                  </p>
                  {company_info?.cin && (
                    <p>
                      <span className="font-medium">CIN:</span>{" "}
                      {company_info.cin}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <h3 className="mb-1 text-[10px] font-semibold">
                  Address Of Delivery
                </h3>
                <div className="space-y-0.5 text-[9px] leading-tight">
                  <p className="font-medium">{invoice.order.user.name}</p>
                  <p>
                    {invoice.order.address?.address?.trim() ||
                      "No address provided"}
                  </p>
                  <p>
                    {invoice.order.address?.city},{" "}
                    {invoice.order.address?.state}
                    {invoice.order.address?.zip_code
                      ? ` (${invoice.order.address.zip_code})`
                      : ""}
                  </p>
                  <p>{invoice.order.address?.country || "India"}</p>
                  <p>{customerPhone ?? "Phone not on file"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b px-2 py-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[8px] leading-tight">
                <thead className="print:table-header-group">
                  <tr className="hidden border-b bg-gray-100 print:table-row">
                    <th
                      colSpan={9}
                      className="p-1 text-center text-[9px] font-semibold tracking-wide"
                    >
                      <span className="font-normal text-muted-foreground">
                        Invoice no.{" "}
                      </span>
                      <span className="tabular-nums">{invoiceNumber}</span>
                    </th>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <th className="p-1 text-left font-medium">Description</th>
                    <th className="p-1 text-right font-medium">Unit</th>
                    <th className="p-1 text-right font-medium">Disc.</th>
                    <th className="p-1 text-right font-medium">IGST</th>
                    <th className="p-1 text-right font-medium">SGST</th>
                    <th className="p-1 text-right font-medium">CGST</th>
                    <th className="p-1 text-right font-medium">Qty</th>
                    <th className="p-1 text-right font-medium">Inc. GST</th>
                    <th className="invoice-pdf-export-hide w-14 p-1 text-right font-medium print:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoice_items.map((item) => {
                    const isCancelled = !!item.cancelled_at;
                    const { gst, igst, other, rate } = aggregateLineTaxes(
                      item.taxes || [],
                    );
                    const intra = gstSummary?.is_intra_state ?? true;
                    const lineIgst = igst + other;
                    let cgstDisplay = 0;
                    let sgstDisplay = 0;
                    let igstDisplay = lineIgst;
                    if (intra && gst > 0) {
                      const split = splitLineGstIntoCgstSgstForDisplay(gst);
                      cgstDisplay = split.cgst;
                      sgstDisplay = split.sgst;
                      igstDisplay = lineIgst;
                    } else if (!intra && gst > 0) {
                      igstDisplay = gst + lineIgst;
                    }
                    const halfRate = rate > 0 ? rate / 2 : 0;

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b",
                          isCancelled && "bg-muted/40 text-muted-foreground",
                        )}
                      >
                        <td className="p-1 align-top">
                          <div>
                            <div className="flex flex-wrap items-center gap-1">
                              <p
                                className={cn(
                                  "font-medium",
                                  isCancelled && "line-through",
                                )}
                              >
                                {item.product_name}
                              </p>
                              {isCancelled && (
                                <Badge
                                  variant="secondary"
                                  className="h-3.5 px-1 text-[7px]"
                                >
                                  Cancelled
                                </Badge>
                              )}
                            </div>
                            <p className="text-[7px] text-gray-600">
                              ID: {item.product_sku || "N/A"}
                            </p>
                            {item.frame_only && (
                              <p className="text-[7px] text-gray-600">
                                Frame Only
                              </p>
                            )}
                            {!item.frame_only &&
                              (item.lens_detail ||
                                item.lens_feature ||
                                item.power_type) && (
                                <p className="mt-0.5 text-[7px] text-gray-600">
                                  {[
                                    (
                                      item.power_type as {
                                        title?: string;
                                      } | null
                                    )?.title,
                                    (
                                      item.lens_detail as {
                                        title?: string;
                                      } | null
                                    )?.title,
                                    (
                                      item.lens_feature as {
                                        title?: string;
                                      } | null
                                    )?.title,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            <p className="text-[7px] text-gray-600">
                              HSN: 90041000
                            </p>
                          </div>
                        </td>
                        <td className="p-1 text-right tabular-nums align-top">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="p-1 text-right tabular-nums align-top">
                          {formatCurrency(item.discount_amount)}
                        </td>
                        <td className="p-1 text-right tabular-nums text-muted-foreground align-top">
                          {formatCurrency(igstDisplay)}
                          {rate > 0 && !intra && (
                            <span className="block text-[7px] text-gray-500">
                              @{rate}%
                            </span>
                          )}
                        </td>
                        <td className="p-1 text-right tabular-nums text-muted-foreground align-top">
                          {intra && gst > 0 ? (
                            <>
                              {formatCurrency(sgstDisplay)}
                              {halfRate > 0 && (
                                <span className="block text-[7px] text-gray-500">
                                  @{halfRate}%
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-1 text-right tabular-nums text-muted-foreground align-top">
                          {intra && gst > 0 ? (
                            <>
                              {formatCurrency(cgstDisplay)}
                              {halfRate > 0 && (
                                <span className="block text-[7px] text-gray-500">
                                  @{halfRate}%
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-1 text-right tabular-nums align-top">
                          {item.quantity}
                        </td>
                        <td className="p-1 text-right font-medium tabular-nums align-top">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="invoice-pdf-export-hide p-1 text-right align-top print:hidden">
                          {!isCancelled &&
                            canCancelAnyLine &&
                            item.order_item_id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1 text-[8px] text-destructive"
                                onClick={() => onCancelLine?.(item.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          {!isCancelled &&
                            canCancelAnyLine &&
                            !item.order_item_id && (
                              <span className="block max-w-[3.5rem] text-[7px] leading-tight text-muted-foreground">
                                Legacy
                              </span>
                            )}
                          {!isCancelled && !canCancelAnyLine && interactive && (
                            <span className="block max-w-[3.5rem] text-[7px] leading-tight text-muted-foreground">
                              Last line
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-b px-3 py-2 text-[9px]">
            <div className="flex justify-end">
              <div className="w-48 space-y-0.5">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    Taxable (ex. GST)
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(taxableAmountExGst)}
                  </span>
                </div>
                {gstSummary && (
                  <>
                    <div className="flex justify-between gap-2 text-muted-foreground">
                      <span>IGST</span>
                      <span className="tabular-nums">
                        {formatCurrency(gstSummary.igst_total)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-muted-foreground">
                      <span>CGST</span>
                      <span className="tabular-nums">
                        {formatCurrency(gstSummary.cgst_total)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-muted-foreground">
                      <span>SGST</span>
                      <span className="tabular-nums">
                        {formatCurrency(gstSummary.sgst_total)}
                      </span>
                    </div>
                    {gstSummary.other_tax_total > 0 && (
                      <div className="flex justify-between gap-2 text-muted-foreground">
                        <span>Other taxes</span>
                        <span className="tabular-nums">
                          {formatCurrency(gstSummary.other_tax_total)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2 border-t border-dashed pt-1 font-medium">
                      <span>Total tax</span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          gstSummary.tax_total_all ?? invoice.tax_total,
                        )}
                      </span>
                    </div>
                    {(invoice.gst_rounded_by ?? gstSummary.rounded_by) !==
                      0 && (
                      <div className="flex justify-between gap-2 text-[8px] text-muted-foreground">
                        <span>Rounded off (GST)</span>
                        <span className="tabular-nums">
                          {formatGstRoundedByPaise(
                            invoice.gst_rounded_by ?? gstSummary.rounded_by,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {!gstSummary && (
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <span>Total tax</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoice.tax_total)}
                    </span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between gap-2 pt-0.5 text-[11px] font-bold">
                  <span>Grand Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(invoice.grand_total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="mb-1 text-[9px] font-semibold">Disclaimer:</h4>
                <div className="space-y-0.5 text-[8px] leading-tight text-gray-600">
                  <p>
                    1. This is computer generated invoice and does not require
                    signature
                  </p>
                  <p>
                    2. For other T&C please refer{" "}
                    {company_info?.website || "www.akkukachasma.com"}
                  </p>
                  <p>3. Tax is payable on reverse charge basis: No</p>
                </div>
              </div>
              <div className="text-center">
                <div className="flex h-14 items-center justify-center border border-dashed border-gray-300">
                  {companySignatureSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL
                    <img
                      src={companySignatureSrc}
                      alt="Authorized Signature"
                      className="h-8 object-contain"
                    />
                  ) : (
                    <span className="text-[8px] text-gray-500">
                      Authorized Signatory
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {voidPageOverlay}
        </div>

        <div className="invoice-a5-sheet relative mt-4 break-before-page overflow-hidden rounded-md border bg-white shadow-sm print:mt-0 print:break-before-page print:shadow-none">
          <InvoiceLineSpecificationsSection
            invoiceNumber={invoiceNumber ?? invoice.invoice_number}
            invoiceItems={invoice.invoice_items}
            prescriptionByOrderItemId={prescriptionByOrderItemId}
            orderLoading={orderLoading}
            orderError={orderError}
            invoice={invoice}
            activeInvoiceItems={invoice.invoice_items}
          />
          {voidPageOverlay}
        </div>
      </div>
    );
  },
);

export default InvoiceDocument;
