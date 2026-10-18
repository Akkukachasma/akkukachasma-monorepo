"use client";

import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { serializeInvoiceDomForPdf } from "./serialize-invoice-dom-for-pdf";

function filenameFromDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1]?.trim() || fallback;
}

/**
 * Download invoice PDF from Nest Puppeteer using the on-screen invoice DOM
 * so layout matches the admin invoice page.
 */
export async function downloadInvoicePdfFromApi(
  invoiceId: string,
  invoiceRoot: HTMLElement,
  filenameBase = "invoice",
): Promise<void> {
  const html = serializeInvoiceDomForPdf(invoiceRoot);
  const api = getApiClient();
  const res = await api.post(
    ENDPOINTS.admin.invoices.pdf(invoiceId),
    { html },
    { responseType: "blob", timeout: 120_000 },
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const disposition = res.headers?.["content-disposition"] as string | undefined;
  const filename = filenameFromDisposition(
    disposition,
    `${filenameBase.replace(/[^\w.-]+/g, "_")}.pdf`,
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadInvoicePdfWithToast(
  invoiceId: string,
  invoiceRoot: HTMLElement | null,
  filenameBase?: string,
): Promise<boolean> {
  if (!invoiceRoot) {
    toast({
      title: "PDF download failed",
      description: "Invoice content is not ready yet.",
      variant: "destructive",
    });
    return false;
  }

  try {
    await downloadInvoicePdfFromApi(invoiceId, invoiceRoot, filenameBase);
    toast({ title: "PDF downloaded" });
    return true;
  } catch (e) {
    console.error(e);
    let message: unknown =
      (e as { response?: { data?: unknown } })?.response?.data ??
      (e instanceof Error ? e.message : "PDF download failed");

    if (typeof Blob !== "undefined" && message instanceof Blob) {
      try {
        const text = await message.text();
        const parsed = JSON.parse(text) as { message?: string };
        message = parsed.message || text;
      } catch {
        message = "PDF download failed";
      }
    }

    toast({
      title: "PDF download failed",
      description: typeof message === "string" ? message : "Unknown error",
      variant: "destructive",
    });
    return false;
  }
}
