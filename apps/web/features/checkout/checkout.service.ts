import { getApiClient } from "@/lib/api";
import html2pdf from "html2pdf.js";
import ENDPOINTS from "@/lib/endpoints";

const apiClient = getApiClient();

export async function getCheckoutDetails(): Promise<any> {
  const response = await apiClient.get(
    ENDPOINTS.checkout.fetch_checkout_details,
  );
  return response.data;
}

export async function fetchPaymentDetails(orderId: string): Promise<any> {
  const response = await apiClient.get(
    ENDPOINTS.payment.fetch_payment_details(orderId),
  );
  return response.data;
}

/**
 * Downloads a DOM element as a PDF receipt.
 * @param type Receipt type (e.g., "success" | "failure")
 * @param elementId DOM element ID to capture as receipt
 */
export async function downloadReceiptPdf(type: string, elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  const html2pdf = (await import("html2pdf.js")).default;

  const opt = {
    margin: 0.5,
    filename: `receipt-${type}-${new Date().toISOString()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
}
