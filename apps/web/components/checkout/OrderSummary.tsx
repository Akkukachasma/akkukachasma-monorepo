"use client";
import React, { useState } from "react";
import ApplyPromoCode from "../cart/ApplyPromoCode";
import { useCheckout, isOrderCheckout } from "@/features/checkout";
import { Button } from "../ui/button";
import useUpdateOrderPaymentMode from "@/lib/mutations/order/useUpdateOrderPaymentMode";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { toast } from "@/lib/hooks/use-toast";
import {
  formatAmount,
  formatGstAmount,
  formatGstRoundedByPaise,
  normalizeGstBreakdown,
  truncate,
} from "@/lib/order-summary-gst";
import useCodAvailability from "@/features/checkout/hooks/useCodAvailability";
import { isPincodeServiceabilityUnavailable } from "@/lib/api";
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

const OrderSummary = () => {
  const [summaryDetails, showSummaryDetails] = useState(true);
  const [gstBreakupOpen, setGstBreakupOpen] = useState(false);
  const [codConfirmOpen, setCodConfirmOpen] = useState(false);
  const { data, isLoading, isGuest } = useCheckout();
  const orderDataForEffect = isOrderCheckout(data) ? data : null;
  const { data: codEnabled = true } = useCodAvailability();

  const { mutateAsync: updatePaymentMode, isPending: updatingPaymentMode } =
    useUpdateOrderPaymentMode(
      isOrderCheckout(data) ? (data?.id ?? "") : "",
    );

  const switchPaymentMode = async (
    payment_mode: "cod" | "online",
    acknowledgeUnverified = false,
  ) => {
    try {
      await updatePaymentMode({
        payment_mode,
        ...(acknowledgeUnverified && {
          acknowledge_unverified_pincode: true,
        }),
      });
      setCodConfirmOpen(false);
    } catch (err) {
      if (
        payment_mode === "cod" &&
        isPincodeServiceabilityUnavailable(err) &&
        !acknowledgeUnverified
      ) {
        setCodConfirmOpen(true);
      }
    }
  };

  React.useEffect(() => {
    if (isLoading || isGuest) return;
    if (!codEnabled && orderDataForEffect?.payment?.mode === "cod") {
      void updatePaymentMode({ payment_mode: "online" });
      toast({
        description:
          "Cash on Delivery is currently unavailable. Switched to online payment.",
      });
    }
  }, [
    codEnabled,
    isGuest,
    isLoading,
    orderDataForEffect?.id,
    orderDataForEffect?.payment?.mode,
    updatePaymentMode,
  ]);

  if (isLoading) {
    return <OrderSummarySkeleton />;
  }

  if (!data) {
    notFound();
  }

  if (isGuest && "cart_items" in data) {
    const summary = data.summary;
    const pricing = "pricing" in data ? data.pricing : null;
    const totalGst = Number(pricing?.total_gst ?? 0);
    const gstBreakdown = normalizeGstBreakdown(pricing?.gst_breakdown, totalGst);
    const appliedCoupon = pricing?.applied_coupon ?? (data.coupon
      ? { coupon: data.coupon, discount: 0 }
      : undefined);
    const couponDiscount = Number(appliedCoupon?.discount ?? 0);
    // Strike = GST-inclusive before coupon; main = after coupon, GST exclusive
    // so main + GST (+ shipping) matches To Pay.
    const subtotalIncludingGst = Number(pricing?.subtotal ?? 0);
    const subtotalExcludingGst = Math.max(
      0,
      subtotalIncludingGst - couponDiscount - gstBreakdown.total_gst,
    );

    return (
      <div className="flex-grow flex flex-col gap-4">
        <div className="space-y-4 w-full">
          <ApplyPromoCode data={appliedCoupon} />
          <Separator className="my-4" />
          {pricing ? (
            <Collapsible
              open={summaryDetails}
              onOpenChange={showSummaryDetails}
              className="flex w-full flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-bold text-base sm:text-lg">
                  <span className="min-w-0">To Pay (GST inclusive)</span>
                  <span className="shrink-0">₹ {truncate(pricing.total || 0)}</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 flex-shrink-0">
                    <ChevronDown />
                    <span className="sr-only">Toggle Price Breakup</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Subtotal (Frame + Lens)</span>
                  <span>
                    <small className="line-through text-foreground/60">
                      ₹ {formatAmount(subtotalIncludingGst)}
                    </small>{" "}
                    ₹ {formatAmount(subtotalExcludingGst)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount on frame</span>
                  <span className="text-destructive">
                    − ₹ {pricing.discount_on_mrp || 0}
                  </span>
                </div>
                {appliedCoupon?.coupon ? (
                  <div className="flex justify-between">
                    <span>
                      Coupon
                      {appliedCoupon.coupon.name
                        ? ` (${String(appliedCoupon.coupon.name).toUpperCase()})`
                        : ""}
                    </span>
                    <span className="text-destructive">
                      − ₹ {appliedCoupon.discount || 0}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Lens Price</span>
                  <span>₹ {pricing.lens_detail_price || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prescription Upload</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span>
                    {pricing.shipping_price ? `₹ ${pricing.shipping_price}` : "Free"}
                  </span>
                </div>
                <Collapsible open={gstBreakupOpen} onOpenChange={setGstBreakupOpen}>
                  <div className="flex items-center justify-between">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span>Total GST</span>
                      <span>₹ {formatGstAmount(gstBreakdown.total_gst)}</span>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 flex-shrink-0">
                        <ChevronDown />
                        <span className="sr-only">Toggle GST Breakup</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-1 flex flex-col gap-2 pl-4">
                    <div className="flex justify-between">
                      <span>CGST</span>
                      <span>₹ {formatGstAmount(gstBreakdown.cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST</span>
                      <span>₹ {formatGstAmount(gstBreakdown.sgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST</span>
                      <span>₹ {formatGstAmount(gstBreakdown.igst)}</span>
                    </div>
                    {gstBreakdown.rounded_by !== 0 && (
                      <div className="flex justify-between text-muted-foreground text-sm">
                        <span>Rounded off (GST)</span>
                        <span>{formatGstRoundedByPaise(gstBreakdown.rounded_by)}</span>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
                <div className="flex justify-between">
                  <span>Other Taxes</span>
                  <span>₹ {(pricing.total_other_taxes ?? 0).toFixed(2)}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="flex justify-between font-bold text-lg">
              <span>Estimated Total</span>
              <span>₹ {(summary?.estimated_total ?? summary?.subtotal ?? 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const orderData = isOrderCheckout(data) ? data : null;
  if (!orderData) return null;

  const gstAmount = orderData?.order_items?.reduce((acc, item) => {
    return acc + (item.taxes?.find((tax) => tax.tax_type === "GST")?.tax_amount || 0);
  }, 0);
  const normalizedGstAmount = Number(gstAmount ?? 0);
  const gstBreakdown = normalizeGstBreakdown(
    orderData?.gst_breakdown,
    normalizedGstAmount,
  );
  const couponDiscount = Number(
    orderData?.pricing?.applied_coupon?.discount ?? 0,
  );
  // Strike = GST-inclusive before coupon; main = after coupon, GST exclusive
  // so main + GST (+ shipping) matches To Pay.
  const subtotalIncludingGst = Number(orderData?.pricing?.subtotal ?? 0);
  const subtotalExcludingGst = Math.max(
    0,
    subtotalIncludingGst - couponDiscount - gstBreakdown.total_gst,
  );

  const otherTaxAmount = orderData?.order_items
    ?.reduce((acc, item) => {
      return (
        acc +
          (item.taxes
            ?.filter((tax) => tax.tax_type !== "GST")
            ?.reduce((acc, tax) => acc + tax.tax_amount, 0) || 0)
      );
    }, 0)
    ?.toFixed(2);

  return (
    <div className="flex-grow flex flex-col gap-4">
      <div className="space-y-4 w-full">
        <ApplyPromoCode
          order_id={orderData?.id}
          data={orderData?.pricing?.applied_coupon}
        />
        <Separator className="my-4" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-base sm:text-lg">Mode Of Payment</span>
          <div
            className={cn(
              "flex flex-wrap gap-1",
              updatingPaymentMode && "pointer-events-none",
            )}
          >
            {codEnabled && (
              <Button
                size="xs"
                disabled={updatingPaymentMode}
                onClick={() => void switchPaymentMode("cod")}
                variant={orderData.payment.mode === "cod" ? "default" : "ghost"}
                className="rounded-2xl"
              >
                COD
              </Button>
            )}
            <Button
              size="xs"
              onClick={() => void switchPaymentMode("online")}
              disabled={updatingPaymentMode}
              variant={orderData.payment.mode === "online" ? "default" : "ghost"}
              className="rounded-2xl"
            >
              Online
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <Collapsible
          open={summaryDetails}
          onOpenChange={showSummaryDetails}
          className="flex w-full flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-bold text-base sm:text-lg">
              <span className="min-w-0">To Pay (GST inclusive)</span>
              <span className="shrink-0">
                ₹ {truncate(orderData?.pricing?.total || 0)}
              </span>
            </div>
            <CollapsibleTrigger className="flex-shrink-0" asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronDown />
                <span className="sr-only">Toggle Price Breakup</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          {orderData.saving && (
            <div className="w-full rounded-lg bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 shadow-sm ring-1 ring-inset ring-green-600/20 sm:px-4 sm:py-3 sm:text-sm">
              🎉 Congratulations!! You're saving{" "}
              <span className="font-bold text-green-800">
                ₹ {orderData.saving.toFixed(2)}
              </span>{" "}
              on this order!
            </div>
          )}
          <CollapsibleContent className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Subtotal (Frame + Lens)</span>
              <span>
                <small className="line-through text-foreground/60">
                  ₹ {formatAmount(subtotalIncludingGst)}
                </small>{" "}
                ₹ {formatAmount(subtotalExcludingGst)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Discount on frame</span>
              <span className="text-destructive">
                − ₹ {orderData?.pricing?.discount_on_mrp || 0}
              </span>
            </div>

            {orderData?.pricing?.applied_coupon?.coupon ? (
              <div className="flex justify-between">
                <span>
                  Coupon
                  {orderData.pricing.applied_coupon.coupon.name
                    ? ` (${String(orderData.pricing.applied_coupon.coupon.name).toUpperCase()})`
                    : ""}
                </span>
                <span className="text-destructive">
                  − ₹ {orderData.pricing.applied_coupon.discount || 0}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between">
              <span>Lens Price</span>
              <span>₹ {orderData?.pricing?.lens_detail_price || 0}</span>
            </div>

            <div className="flex justify-between">
              <span>Prescription Upload</span>
              <span>Free</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping Cost</span>
              <span>
                {orderData?.pricing?.shipping_price
                  ? `₹ ${orderData?.pricing?.shipping_price}`
                  : "Free"}
              </span>
            </div>

            <Collapsible open={gstBreakupOpen} onOpenChange={setGstBreakupOpen}>
              <div className="flex items-center justify-between">
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Total GST</span>
                  <span>₹ {formatGstAmount(gstBreakdown.total_gst)}</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 flex-shrink-0">
                    <ChevronDown />
                    <span className="sr-only">Toggle GST Breakup</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-1 flex flex-col gap-2 pl-4">
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>₹ {formatGstAmount(gstBreakdown.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>₹ {formatGstAmount(gstBreakdown.sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span>₹ {formatGstAmount(gstBreakdown.igst)}</span>
                </div>
                {gstBreakdown.rounded_by !== 0 && (
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Rounded off (GST)</span>
                    <span>{formatGstRoundedByPaise(gstBreakdown.rounded_by)}</span>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-between">
              <span>Other Taxes</span>
              <span>₹ {otherTaxAmount}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <AlertDialog open={codConfirmOpen} onOpenChange={setCodConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delivery verification unavailable</AlertDialogTitle>
            <AlertDialogDescription>
              We temporarily can’t verify COD for this pincode. You can still
              continue with Cash on Delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void switchPaymentMode("cod", true)}
            >
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const OrderSummarySkeleton = () => {
  return (
    <div className="flex-grow flex flex-col gap-4">
      <div className="space-y-4 w-full">
        <div className="flex justify-between w-full">
          <Skeleton className="w-64" />
          <Skeleton className="w-32 h-9" />
        </div>
        <Separator className="my-4" />

        <div className="flex justify-between">
          <Skeleton className="w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-2xl bg-foreground/80" />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-grow justify-between font-bold text-lg">
              <Skeleton className="w-20" />
              <Skeleton className="w-32 h-2" />
            </div>
            <Skeleton className="size-9 rounded-md" />
          </div>
          <div className="w-full rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm ring-1 ring-inset ring-green-600/20">
            <Skeleton className="w-3/4 h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
