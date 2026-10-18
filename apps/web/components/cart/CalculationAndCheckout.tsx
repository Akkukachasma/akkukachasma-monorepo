"use client";

import useFetch from "@/lib/hooks/use-fetch";
import { IGetCartResponse } from "./CartItems";
import ENDPOINTS from "@/lib/endpoints";
import { Button, ProcessIndicator } from "../ui/button";
import useCartCheckout from "@/lib/mutations/order/useCartCheckout";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { useLoggedInUser } from "@/features/auth";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

const CalculationAndCheckout = () => {
  const { data: user, isLoading: authLoading } = useLoggedInUser();
  const isGuest = !authLoading && !user;

  const { data, isFetching } = useFetch<IGetCartResponse>({
    endpoint: ENDPOINTS.cart.fetch_items,
  });

  const quantityUpdatePendingCount = useAppSelector(
    (state) => state.cartStore.quantityUpdatePendingCount,
  );

  const { mutate: cartCheckout, isPending: checkingOut } = useCartCheckout();

  const isEstimationStale =
    quantityUpdatePendingCount > 0 || isFetching;

  if (authLoading || (!data && isFetching)) {
    return <CalculationAndCheckoutSkeleton />;
  }

  if (!Array.isArray(data?.cart_items) || !data?.cart_items.length) return null;

  const estimatedTotal =
    data?.summary?.estimated_total ??
    data?.summary?.subtotal ??
    (Array.isArray(data?.cart_items)
      ? data.cart_items.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0,
        )
      : 0);

  const checkoutLabel = data.checkout_initiated
    ? "Complete Pending Checkout"
    : isEstimationStale
      ? "Updating..."
      : "Checkout";

  const checkoutButton = data.checkout_initiated ? (
    isEstimationStale ? (
      <Button
        type="button"
        className="w-full rounded-3xl sm:w-auto"
        size="lg"
        disabled
      >
        Updating...
      </Button>
    ) : (
      <Button
        type="button"
        className="w-full rounded-3xl sm:w-auto"
        size="lg"
        asChild
      >
        <Link href="/checkout">{checkoutLabel}</Link>
      </Button>
    )
  ) : isGuest ? (
    <Button
      className="w-full rounded-3xl sm:w-auto"
      size="lg"
      disabled={isEstimationStale}
      asChild
    >
      <Link href="/checkout">{checkoutLabel}</Link>
    </Button>
  ) : (
    <Button
      type="button"
      className="w-full rounded-3xl sm:w-auto"
      size="lg"
      disabled={checkingOut || isEstimationStale}
      onClick={() => cartCheckout()}
    >
      <ProcessIndicator
        isProcessing={checkingOut}
        btnText={checkoutLabel}
      />
    </Button>
  );

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-auto border-t border-border bg-background/95 px-4 py-3 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/80",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-center text-sm font-medium text-foreground/90 sm:text-left sm:text-base">
          Estimated Price:{" "}
          <span className="text-foreground">₹ {estimatedTotal}</span>
        </p>
        {checkoutButton}
      </div>
    </div>
  );
};

const CalculationAndCheckoutSkeleton = () => {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 py-3",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:px-0 sm:py-0",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <Skeleton className="mx-auto h-5 w-48 sm:mx-0" />
        <Skeleton className="h-11 w-full rounded-3xl sm:h-10 sm:w-36" />
      </div>
    </div>
  );
};

export default CalculationAndCheckout;
