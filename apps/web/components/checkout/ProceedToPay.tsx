"use client";
import { useState } from "react";
import { Button, ProcessIndicator } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import useInitiatePayment from "@/lib/mutations/payment/useInitiatePayment";
import {
  useCheckout,
  isOrderCheckout,
  PaymentVerificationScreen,
} from "@/features/checkout";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

const ProceedToPay = () => {
  const { data, isLoading, isGuest } = useCheckout();
  const {
    mutateAsync: makePayment,
    isPending: initiatingPayment,
    isVerifyingPayment,
  } = useInitiatePayment(isOrderCheckout(data) ? data?.id || "" : "");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stickyBarClass = cn(
    "sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur",
    "supports-[backdrop-filter]:bg-background/80",
    "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
    "md:static md:mx-0 md:mt-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none",
  );

  const pay = async (acknowledgeUnverified = false) => {
    try {
      await makePayment(
        acknowledgeUnverified
          ? { acknowledge_unverified_pincode: true }
          : undefined,
      );
      setConfirmOpen(false);
    } catch (err) {
      if (isPincodeServiceabilityUnavailable(err) && !acknowledgeUnverified) {
        setConfirmOpen(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={stickyBarClass}>
        <div className="flex justify-end md:justify-end">
          <Skeleton className="h-11 w-full rounded-3xl md:h-10 md:w-36" />
        </div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className={stickyBarClass}>
        <Button size="lg" className="w-full rounded-3xl md:w-auto md:min-w-32" asChild>
          <Link href={`/login?from=${encodeURIComponent("/checkout")}`}>
            Sign in to Pay
          </Link>
        </Button>
      </div>
    );
  }

  const orderData = isOrderCheckout(data) ? data : null;
  if (!orderData) return null;

  const isCod = orderData?.payment?.mode === "cod";

  const payButton = (
    <Button
      onClick={() => void pay()}
      size="lg"
      disabled={initiatingPayment}
      className="w-full rounded-3xl md:w-auto md:min-w-32"
    >
      <ProcessIndicator
        btnText={isCod ? "Place Order" : "Pay Now"}
        isProcessing={initiatingPayment}
      />
    </Button>
  );

  return (
    <>
      <PaymentVerificationScreen open={isVerifyingPayment} />
      <div className={stickyBarClass}>
        <div className="flex justify-end">{payButton}</div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Can&apos;t verify delivery right now
            </AlertDialogTitle>
            <AlertDialogDescription>
              We temporarily can&apos;t confirm delivery for this pin code. You
              can still continue with payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void pay(true)}>
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProceedToPay;
