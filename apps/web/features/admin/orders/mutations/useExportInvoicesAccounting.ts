import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient } from "@/lib/api";

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

const useExportInvoicesAccounting = () => {
  const api = getApiClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const response = await api.post(
        ENDPOINTS.admin.invoices.export_accounting(),
        { order_ids: orderIds },
        { responseType: "arraybuffer" },
      );

      const skipReport = decodeBase64UrlJson<SkipReport>(
        response.headers["x-export-skip-report"],
      );
      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      const filenameMatch = disposition?.match(/filename="(.+?)"/i);
      const filename = filenameMatch?.[1] ?? "invoice-export.xlsx";

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      return { blob, filename, skipReport };
    },
  });
};

export default useExportInvoicesAccounting;
