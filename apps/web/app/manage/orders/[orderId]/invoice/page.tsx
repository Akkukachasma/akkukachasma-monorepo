"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Mail, Printer, Loader2 } from "lucide-react";
import useGetInvoice from "@/features/admin/invoices/queries/useGetInvoice";
import useCreateInvoice from "@/features/admin/invoices/mutations/useCreateInvoice";
import useCancelInvoiceLine from "@/features/admin/invoices/mutations/useCancelInvoiceLine";
import useUpdateInvoiceStatus from "@/features/admin/invoices/mutations/useUpdateInvoiceStatus";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PageWrapper from "@/components/wrappers/PageWrapper";
import useGetOrder from "@/features/admin/orders/queries/useGetOrder";
import InvoiceDocument from "@/features/admin/invoices/components/InvoiceDocument";
import { printElementRef } from "@/lib/print-dom-nodes";
import { downloadInvoicePdfWithToast } from "@/features/admin/invoices/utils/download-invoice-pdf";

const InvoicePage = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: invoiceData, isLoading, error } = useGetInvoice(orderId);
  const {
    data: orderForSpecs,
    isPending: orderSpecsPending,
    isError: orderSpecsError,
  } = useGetOrder(orderId, {
    enabled: !!orderId && !!invoiceData?.invoice,
  });

  const prescriptionByOrderItemId = useMemo(() => {
    const map: Record<string, unknown | null | undefined> = {};
    if (!orderForSpecs?.order_items?.length) return map;
    for (const oi of orderForSpecs.order_items) {
      map[oi.id] = oi.prescription;
    }
    return map;
  }, [orderForSpecs]);
  const createInvoiceMutation = useCreateInvoice();
  const cancelLineMutation = useCancelInvoiceLine();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();
  const [lineIdToCancel, setLineIdToCancel] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const invoiceNumber = invoiceData?.invoice?.invoice_number;
  /** Wraps invoice page 1 + page 2 for browser print. */
  const invoicePrintRootRef = useRef<HTMLDivElement>(null);

  const handleCreateInvoice = () => {
    if (orderId) {
      createInvoiceMutation.mutate(orderId);
    }
  };

  const handlePrint = useCallback(() => {
    void printElementRef(invoicePrintRootRef);
  }, []);

  const handleDownload = async () => {
    const id = invoiceData?.invoice?.id;
    if (!id) {
      return;
    }
    setPdfDownloading(true);
    try {
      await downloadInvoicePdfWithToast(
        id,
        invoicePrintRootRef.current,
        invoiceNumber || `invoice-${id}`,
      );
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log("Send invoice via email");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unpaid":
        return "bg-amber-100 text-amber-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "void":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <HeaderWrapper
        title="Invoice"
        tagline="Loading invoice..."
        onBackUrl={`/manage/orders/${orderId}`}
      />
    );
  }

  if (error || !invoiceData) {
    return (
      <HeaderWrapper
        title="Invoice"
        tagline="No invoice found"
        onBackUrl={`/manage/orders/${orderId}`}
      >
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCreateInvoice}
            disabled={createInvoiceMutation.isPending}
          >
            {createInvoiceMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Create Invoice
          </Button>
        </div>
      </HeaderWrapper>
    );
  }

  const { invoice, company_info } = invoiceData;
  const orderIsCancelled = invoice.order.status === "cancelled";

  return (
    <>
      <AlertDialog
        open={!!lineIdToCancel}
        onOpenChange={(open) => !open && setLineIdToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this line?</AlertDialogTitle>
            <AlertDialogDescription>
              Stock will be returned for this SKU and the order will be updated.
              This cannot be undone from the invoice page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelLineMutation.isPending}
              onClick={() => {
                if (!lineIdToCancel) return;
                cancelLineMutation.mutate(
                  {
                    orderId,
                    invoiceId: invoice.id,
                    itemId: lineIdToCancel,
                  },
                  { onSettled: () => setLineIdToCancel(null) },
                );
              }}
            >
              {cancelLineMutation.isPending ? "Cancelling…" : "Confirm cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HeaderWrapper
        title="Tax Invoice"
        tagline={`Invoice #${invoiceNumber}`}
        onBackUrl={`/manage/orders/${orderId}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.toUpperCase()}
          </Badge>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">
              Set status
            </span>
            <Select
              value={invoice.status}
              disabled={
                updateInvoiceStatusMutation.isPending || orderIsCancelled
              }
              onValueChange={(value) => {
                updateInvoiceStatusMutation.mutate({
                  orderId,
                  invoiceId: invoice.id,
                  status: value as "unpaid" | "paid" | "void",
                });
              }}
            >
              <SelectTrigger
                className="h-8 w-[120px]"
                title={
                  orderIsCancelled
                    ? "Invoice status cannot be changed when the order is cancelled."
                    : undefined
                }
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
            {orderIsCancelled && (
              <span className="text-muted-foreground max-w-[14rem] leading-snug">
                Order cancelled — status is locked.
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
            disabled={pdfDownloading || !invoiceData?.invoice?.id}
          >
            {pdfDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
          <Button size="sm" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </HeaderWrapper>

      <PageWrapper>
        <InvoiceDocument
          ref={invoicePrintRootRef}
          invoice={invoice}
          company_info={company_info}
          prescriptionByOrderItemId={prescriptionByOrderItemId}
          orderLoading={orderSpecsPending}
          orderError={orderSpecsError}
          onCancelLine={setLineIdToCancel}
        />
      </PageWrapper>
    </>
  );
};

export default InvoicePage;
