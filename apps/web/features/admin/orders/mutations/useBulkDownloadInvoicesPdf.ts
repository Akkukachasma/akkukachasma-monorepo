import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient } from "@/lib/api";
import { buildBulkInvoiceHtmlPayloads } from "@/features/admin/invoices/utils/build-bulk-invoice-html";

type SkipReport = {
  exportedCount: number;
  skippedNoInvoiceOrderIds: string[];
  skippedVoidOrderIds: string[];
  truncated?: boolean;
};

function decodeBase64UrlJson<T>(value?: string | null): T | null {
  if (!value) return null;
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

const LIST_CAP = 30;

const useBulkDownloadInvoicesPdf = () => {
  const api = getApiClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const built = await buildBulkInvoiceHtmlPayloads(orderIds);

      if (built.invoices.length === 0) {
        const err = new Error(
          "No exportable invoices found for selected orders.",
        ) as Error & {
          response?: {
            data?: {
              message?: string;
              skipped_no_invoice_order_ids?: string[];
              skipped_void_order_ids?: string[];
            };
          };
        };
        err.response = {
          data: {
            message: "No exportable invoices found for selected orders.",
            skipped_no_invoice_order_ids: built.skippedNoInvoiceOrderIds,
            skipped_void_order_ids: built.skippedVoidOrderIds,
          },
        };
        throw err;
      }

      const response = await api.post(
        ENDPOINTS.admin.invoices.bulk_pdf(),
        { invoices: built.invoices },
        { responseType: "arraybuffer", timeout: 300_000 },
      );

      const serverSkip = decodeBase64UrlJson<SkipReport>(
        response.headers["x-export-skip-report"],
      );
      const skipReport: SkipReport = {
        exportedCount:
          serverSkip?.exportedCount ?? built.invoices.length,
        skippedNoInvoiceOrderIds: built.skippedNoInvoiceOrderIds.slice(
          0,
          LIST_CAP,
        ),
        skippedVoidOrderIds: built.skippedVoidOrderIds.slice(0, LIST_CAP),
        truncated:
          built.skippedNoInvoiceOrderIds.length > LIST_CAP ||
          built.skippedVoidOrderIds.length > LIST_CAP,
      };

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      const filenameMatch = disposition?.match(/filename="(.+?)"/i);
      const filename = filenameMatch?.[1] ?? "invoices-bulk.pdf";

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      return { blob, filename, skipReport };
    },
  });
};

export default useBulkDownloadInvoicesPdf;
