"use client";

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import InvoiceDocument from "@/features/admin/invoices/components/InvoiceDocument";
import type {
  InvoiceWithCompanyInfo,
} from "@/features/admin/invoices/queries/useGetInvoice";
import type { Order } from "@/features/admin/orders/queries/useGetOrder";
import {
  collectInvoiceDocumentCss,
  serializeInvoiceDomForPdf,
} from "./serialize-invoice-dom-for-pdf";

export type InvoiceHtmlPayload = {
  id: string;
  html: string;
};

export type BulkInvoiceHtmlResult = {
  invoices: InvoiceHtmlPayload[];
  skippedNoInvoiceOrderIds: string[];
  skippedVoidOrderIds: string[];
};

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        img.complete ||
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

async function fetchInvoiceWithCompanyInfo(
  orderId: string,
): Promise<InvoiceWithCompanyInfo | null> {
  const api = getApiClient();
  try {
    const response = await api.get(
      ENDPOINTS.admin.invoices.fetch_by_order_with_company_info(orderId),
    );
    return (response.data?.data ?? null) as InvoiceWithCompanyInfo | null;
  } catch {
    return null;
  }
}

async function fetchOrder(orderId: string): Promise<Order | null> {
  const api = getApiClient();
  try {
    const response = await api.get(
      ENDPOINTS.admin.orders.fetch_single(orderId),
    );
    return (response.data?.data ?? null) as Order | null;
  } catch {
    return null;
  }
}

/**
 * Mount InvoiceDocument offscreen, serialize with the same util as single PDF.
 */
async function renderInvoiceHtmlOffscreen(
  data: InvoiceWithCompanyInfo,
  prescriptionByOrderItemId: Record<string, unknown | null | undefined>,
  orderError: boolean,
  css: string,
): Promise<string> {
  const host = document.createElement("div");
  host.setAttribute("data-invoice-pdf-offscreen", "1");
  host.style.cssText =
    "position:fixed;left:0;top:0;width:148mm;opacity:0;pointer-events:none;z-index:-1;overflow:hidden;";
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    root = createRoot(host);
    flushSync(() => {
      root!.render(
        <InvoiceDocument
          invoice={data.invoice}
          company_info={data.company_info}
          prescriptionByOrderItemId={prescriptionByOrderItemId}
          orderLoading={false}
          orderError={orderError}
          interactive={false}
        />,
      );
    });
    await waitForPaint();
    const invoiceRoot = host.firstElementChild as HTMLElement | null;
    if (!invoiceRoot) {
      throw new Error("Invoice document failed to render");
    }
    invoiceRoot.querySelectorAll("img").forEach((img) => {
      img.setAttribute("loading", "eager");
    });
    await waitForImages(invoiceRoot);
    await waitForPaint();
    return serializeInvoiceDomForPdf(invoiceRoot, { css });
  } finally {
    root?.unmount();
    host.remove();
  }
}

/**
 * For each eligible order: fetch invoice + order specs, render offscreen,
 * serialize HTML identical to single-invoice PDF download.
 */
export async function buildBulkInvoiceHtmlPayloads(
  orderIds: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<BulkInvoiceHtmlResult> {
  const uniqueOrderIds = [...new Set(orderIds)];
  const skippedNoInvoiceOrderIds: string[] = [];
  const skippedVoidOrderIds: string[] = [];
  const invoices: InvoiceHtmlPayload[] = [];
  const css = collectInvoiceDocumentCss();
  const total = uniqueOrderIds.length;

  for (let i = 0; i < uniqueOrderIds.length; i++) {
    const orderId = uniqueOrderIds[i];
    const data = await fetchInvoiceWithCompanyInfo(orderId);
    if (!data?.invoice) {
      skippedNoInvoiceOrderIds.push(orderId);
      onProgress?.(i + 1, total);
      continue;
    }
    if (data.invoice.status === "void") {
      skippedVoidOrderIds.push(orderId);
      onProgress?.(i + 1, total);
      continue;
    }

    const order = await fetchOrder(orderId);
    const prescriptionByOrderItemId: Record<
      string,
      unknown | null | undefined
    > = {};
    if (order?.order_items?.length) {
      for (const oi of order.order_items) {
        prescriptionByOrderItemId[oi.id] = oi.prescription;
      }
    }

    const html = await renderInvoiceHtmlOffscreen(
      data,
      prescriptionByOrderItemId,
      !order,
      css,
    );
    invoices.push({ id: data.invoice.id, html });
    onProgress?.(i + 1, total);
  }

  return {
    invoices,
    skippedNoInvoiceOrderIds,
    skippedVoidOrderIds,
  };
}
