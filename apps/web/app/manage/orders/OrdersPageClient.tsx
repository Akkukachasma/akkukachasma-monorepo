"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Filter, FileSpreadsheet, FileText, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setSearchTerm,
  setSortBy,
  setStatus,
  setPaymentStatus,
  setPaymentMode,
  setStartDate,
  setEndDate,
} from "@/features/admin/orders/store/orders.slice";
import OrderFiltersForm, {
  type OrderUiFilters,
} from "@/features/admin/orders/components/OrderFiltersForm";
import OrderList, {
  isOrderBulkSelectable,
} from "@/features/admin/orders/components/OrderList";
import { ManifestProgressPanel } from "@/features/admin/orders/components/ManifestProgressPanel";
import useGetOrders from "@/features/admin/orders/queries/useGetOrders";
import { isOrderExportSelectable } from "@/features/admin/orders/utils/export-eligibility";
import { isOrderManifestSelectable } from "@/features/admin/orders/utils/manifest-eligibility";
import useManifestOrders from "@/features/admin/orders/mutations/useManifestOrders";
import { toast } from "@/lib/hooks/use-toast";
import useExportInvoicesAccounting from "@/features/admin/orders/mutations/useExportInvoicesAccounting";
import useBulkDownloadInvoicesPdf from "@/features/admin/orders/mutations/useBulkDownloadInvoicesPdf";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PageWrapper from "@/components/wrappers/PageWrapper";

const OrdersPageClient: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    search_term,
    sort_by,
    status,
    payment_status,
    payment_mode,
    start_date,
    end_date,
  } = useAppSelector((state) => state.ordersStore.data);

  const [uiFilters, setUiFilters] = useState<OrderUiFilters>({
    search: search_term,
    status,
    payment_status,
    payment_mode,
    sort_by,
    start_date,
    end_date,
  });
  const [filters, setFilters] = useState(uiFilters);
  const [headerSearchInput, setHeaderSearchInput] = useState(search_term);

  const debouncedSetFilters = useDebounce((newFilters: OrderUiFilters) => {
    setFilters(newFilters);
  }, 400);
  const debouncedHeaderSearch = useDebounce((nextSearch: string) => {
    setUiFilters((prev) => ({ ...prev, search: nextSearch }));
  }, 400);

  useEffect(() => {
    debouncedSetFilters(uiFilters);
  }, [uiFilters, debouncedSetFilters]);
  useEffect(() => {
    setHeaderSearchInput(uiFilters.search);
  }, [uiFilters.search]);

  useEffect(() => {
    dispatch(setSearchTerm(filters.search));
    dispatch(setSortBy(filters.sort_by));
    dispatch(setStatus(filters.status));
    dispatch(setPaymentStatus(filters.payment_status));
    dispatch(setPaymentMode(filters.payment_mode));
    dispatch(setStartDate(filters.start_date));
    dispatch(setEndDate(filters.end_date));
  }, [filters, dispatch]);

  const filterKeyRef = useRef<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());
  const [pageSize, setPageSize] = useState(20);
  const [manifestConfirmOpen, setManifestConfirmOpen] = useState(false);

  useEffect(() => {
    const next = JSON.stringify(filters);
    if (filterKeyRef.current === null) {
      filterKeyRef.current = next;
      return;
    }
    if (filterKeyRef.current !== next) {
      filterKeyRef.current = next;
      setPage(1);
      setSelectedIds(new Set());
    }
  }, [filters]);

  const { data: orders, isLoading, isFetching, total } = useGetOrders({
    page,
    pageSize: pageSize,
  });
  const exportInvoices = useExportInvoicesAccounting();
  const bulkDownloadPdf = useBulkDownloadInvoicesPdf();
  const manifestOrders = useManifestOrders();

  useEffect(() => {
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const o of orders ?? []) {
        if (next.has(o.id) && !isOrderBulkSelectable(o)) {
          next.delete(o.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [orders]);

  const selectedOrders = useMemo(
    () => (orders ?? []).filter((o) => selectedIds.has(o.id)),
    [orders, selectedIds],
  );
  const exportEligibleSelected = useMemo(
    () => selectedOrders.filter(isOrderExportSelectable),
    [selectedOrders],
  );
  /** Include off-page selections; backend skips ineligible. Drop known ineligible on this page. */
  const manifestOrderIds = useMemo(() => {
    return [...selectedIds].filter((id) => {
      const o = (orders ?? []).find((x) => x.id === id);
      if (!o) return true;
      return isOrderManifestSelectable(o);
    });
  }, [orders, selectedIds]);

  const handleFilterChange = (key: keyof OrderUiFilters, value: string) => {
    setUiFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleHeaderSearchEnter = () => {
    setUiFilters((prev) => ({ ...prev, search: headerSearchInput }));
    setFilters((prev) => ({ ...prev, search: headerSearchInput }));
  };

  const toggleId = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const togglePageIds = (ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleExport = async () => {
    if (exportEligibleSelected.length === 0 || exportInvoices.isPending) {
      toast({
        title: "Nothing to export",
        description: "Select orders that have a non-void invoice.",
        variant: "destructive",
      });
      return;
    }
    const selectedOrderIds = exportEligibleSelected.map((o) => o.id);
    try {
      const result = await exportInvoices.mutateAsync(selectedOrderIds);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const noInvoiceCount = result.skipReport?.skippedNoInvoiceOrderIds.length ?? 0;
      const voidCount = result.skipReport?.skippedVoidOrderIds.length ?? 0;
      const hasSkips = noInvoiceCount + voidCount > 0;
      const descriptionParts: string[] = [];
      if (noInvoiceCount > 0) {
        const ids = result.skipReport?.skippedNoInvoiceOrderIds.slice(0, 3).join(", ");
        descriptionParts.push(
          `${noInvoiceCount} skipped (no invoice${ids ? `: ${ids}` : ""})`,
        );
      }
      if (voidCount > 0) {
        const ids = result.skipReport?.skippedVoidOrderIds.slice(0, 3).join(", ");
        descriptionParts.push(
          `${voidCount} skipped (void invoice${ids ? `: ${ids}` : ""})`,
        );
      }
      if (result.skipReport?.truncated) {
        descriptionParts.push("not all skipped order IDs are listed");
      }

      toast({
        title: hasSkips ? "Export complete with skips" : "Export complete",
        description: hasSkips
          ? `${descriptionParts.join(", ")}.`
          : "Excel file downloaded successfully.",
      });
    } catch (error: any) {
      const skippedNoInvoice: string[] =
        error?.response?.data?.skipped_no_invoice_order_ids ?? [];
      const skippedVoid: string[] =
        error?.response?.data?.skipped_void_order_ids ?? [];
      const details: string[] = [];
      if (skippedNoInvoice.length > 0) {
        details.push(
          `${skippedNoInvoice.length} no-invoice (${skippedNoInvoice
            .slice(0, 3)
            .join(", ")})`,
        );
      }
      if (skippedVoid.length > 0) {
        details.push(
          `${skippedVoid.length} void (${skippedVoid.slice(0, 3).join(", ")})`,
        );
      }
      toast({
        title: "Export failed",
        description: details.length
          ? `${error?.response?.data?.message || "No exportable invoices found."} ${details.join("; ")}`
          : error?.response?.data?.message ||
            error?.message ||
            "Failed to export invoices.",
        variant: "destructive",
      });
    }
  };

  const handleManifestConfirm = async () => {
    if (manifestOrderIds.length === 0 || manifestOrders.isPending) return;
    try {
      const result = await manifestOrders.mutateAsync(manifestOrderIds);
      toast({
        title: "Ready To Ship started",
        description: `Manifesting ${result.accepted} order(s). Progress updates live below.`,
      });
      setSelectedIds(new Set());
      setManifestConfirmOpen(false);
    } catch {
      // toast handled in mutation
    }
  };

  const handleBulkDownloadPdf = async () => {
    if (exportEligibleSelected.length === 0 || bulkDownloadPdf.isPending) {
      toast({
        title: "Nothing to download",
        description: "Select orders that have a non-void invoice.",
        variant: "destructive",
      });
      return;
    }
    const selectedOrderIds = exportEligibleSelected.map((o) => o.id);
    toast({
      title: "Preparing invoice PDF…",
      description: `Rendering ${selectedOrderIds.length} invoice(s) with the admin layout.`,
    });
    try {
      const result = await bulkDownloadPdf.mutateAsync(selectedOrderIds);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const noInvoiceCount = result.skipReport?.skippedNoInvoiceOrderIds.length ?? 0;
      const voidCount = result.skipReport?.skippedVoidOrderIds.length ?? 0;
      const hasSkips = noInvoiceCount + voidCount > 0;
      const descriptionParts: string[] = [];
      if (result.skipReport?.exportedCount) {
        descriptionParts.push(
          `${result.skipReport.exportedCount} invoice(s) exported`,
        );
      }
      if (noInvoiceCount > 0) {
        const ids = result.skipReport?.skippedNoInvoiceOrderIds.slice(0, 3).join(", ");
        descriptionParts.push(
          `${noInvoiceCount} skipped (no invoice${ids ? `: ${ids}` : ""})`,
        );
      }
      if (voidCount > 0) {
        const ids = result.skipReport?.skippedVoidOrderIds.slice(0, 3).join(", ");
        descriptionParts.push(
          `${voidCount} skipped (void invoice${ids ? `: ${ids}` : ""})`,
        );
      }
      if (result.skipReport?.truncated) {
        descriptionParts.push("not all skipped order IDs are listed");
      }

      toast({
        title: hasSkips ? "PDF download complete with skips" : "PDF download complete",
        description: hasSkips
          ? `${descriptionParts.join(", ")}.`
          : descriptionParts[0]
            ? `${descriptionParts[0]}.`
            : "Invoice PDF downloaded successfully.",
      });
    } catch (error: any) {
      const skippedNoInvoice: string[] =
        error?.response?.data?.skipped_no_invoice_order_ids ?? [];
      const skippedVoid: string[] =
        error?.response?.data?.skipped_void_order_ids ?? [];
      const details: string[] = [];
      if (skippedNoInvoice.length > 0) {
        details.push(
          `${skippedNoInvoice.length} no-invoice (${skippedNoInvoice
            .slice(0, 3)
            .join(", ")})`,
        );
      }
      if (skippedVoid.length > 0) {
        details.push(
          `${skippedVoid.length} void (${skippedVoid.slice(0, 3).join(", ")})`,
        );
      }
      toast({
        title: "PDF download failed",
        description: details.length
          ? `${error?.response?.data?.message || "No exportable invoices found."} ${details.join("; ")}`
          : error?.response?.data?.message ||
            error?.message ||
            "Failed to download invoices PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <HeaderWrapper
        title="Orders Management"
        tagline="Search, filter, and export orders"
      >
        <div className="relative w-full max-w-md sm:w-64 md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by phone, order ID, payment ID..."
            value={headerSearchInput}
            onChange={(e) => {
              const value = e.target.value;
              setHeaderSearchInput(value);
              debouncedHeaderSearch(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleHeaderSearchEnter();
              }
            }}
            className="h-9 pl-10"
          />
        </div>
        {selectedIds.size > 0 ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManifestConfirmOpen(true)}
              disabled={
                manifestOrderIds.length === 0 || manifestOrders.isPending
              }
            >
              <Truck className="mr-2 h-4 w-4" />
              {manifestOrders.isPending
                ? "Starting…"
                : `Ready To Ship (${manifestOrderIds.length})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={
                exportEligibleSelected.length === 0 || exportInvoices.isPending
              }
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {exportInvoices.isPending ? "Exporting..." : "Export to Excel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownloadPdf}
              disabled={
                exportEligibleSelected.length === 0 || bulkDownloadPdf.isPending
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              {bulkDownloadPdf.isPending ? "Downloading..." : "Download Invoice"}
            </Button>
          </>
        ) : null}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg"
          >
            <SheetHeader className="border-b pb-4 text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow orders by customer, status, payment, and dates.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-6 pr-1">
              <OrderFiltersForm
                uiFilters={uiFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </HeaderWrapper>

      <PageWrapper className="pt-0">
        <ManifestProgressPanel />
        <OrderList
          page={page}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onPageChange={setPage}
          orders={orders ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          total={total}
          selectedIds={selectedIds}
          onToggleId={toggleId}
          onTogglePageIds={togglePageIds}
        />
      </PageWrapper>

      <AlertDialog open={manifestConfirmOpen} onOpenChange={setManifestConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ready To Ship?</AlertDialogTitle>
            <AlertDialogDescription>
              Create Delhivery shipments for {manifestOrderIds.length} selected
              order
              {manifestOrderIds.length === 1 ? "" : "s"}. This assigns AWBs and
              cannot be undone from here. Progress will update in realtime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleManifestConfirm();
              }}
              disabled={manifestOrders.isPending}
            >
              {manifestOrders.isPending ? "Starting…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPageClient;
