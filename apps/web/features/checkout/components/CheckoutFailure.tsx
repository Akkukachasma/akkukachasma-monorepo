"use client";
import Image from "next/image";
import ReceiptDetail from "./ReceiptDetail";
import { Button } from "@/components/ui/button";
import usePaymentDetails from "../queries/usePaymentDetails";
import { notFound, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { downloadReceiptPdf } from "../checkout.service";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const CheckoutFailure = () => {
  const order_id = useSearchParams().get("order_id");
  const { data, isLoading } = usePaymentDetails(order_id || "");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-10">
        <div className="flex w-full max-w-[550px] flex-col gap-6 px-4">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          Order not found
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find payment details for this order. You can retry
          checkout or return to your cart.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="lg" asChild>
            <Link href="/checkout">Retry checkout</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (data.order_status === "initiated" || data.payment_status !== "failed") {
    notFound();
  }

  return (
    <div
      id="receipt-container"
      className="h-full flex items-center justify-center py-10"
    >
      <div className="flex flex-col gap-14 px-4 w-full max-w-[550px] mx-auto">
        {/* Header with failure message */}
        <div className="text-center">
          <Image
            src="/failed.gif"
            alt="Checkout failed gif"
            width={60}
            height={60}
            className="mb-3 size-[60px] mx-auto print:hidden"
          />
          <p className="text-destructive text-2xl font-semibold">
            Checkout Failed
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Order ID: {data.order_id}
          </p>
        </div>

        {/* Payment & User Details */}
        <div className="flex flex-col gap-6">
          {/* User Contact Info */}
          <div className="flex flex-col gap-2">
            <ReceiptDetail
              title="Payment Mode"
              value={data.mode === "cod" ? "Cash on Delivery" : "Online"}
            />
            <ReceiptDetail title="Mobile" value={data.phone_number} />
            <ReceiptDetail title="Email" value={data.email} />
          </div>

          <Separator />

          {/* Amount */}
          <ReceiptDetail
            title="Order Amount"
            value={`₹ ${data.amount.toFixed(2)}`}
            extraBold
          />

          {/* Payment Info */}
          <div className="flex flex-col gap-2">
            <ReceiptDetail title="Currency" value={data.currency} />
            <ReceiptDetail title="Payment Status" value={data.payment_status} />
            <ReceiptDetail title="Transaction ID" value={data.transaction_id} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={() => downloadReceiptPdf("failure", "receipt-container")}
            size="lg"
          >
            Print
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/checkout">Retry payment</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CheckoutFailure;
