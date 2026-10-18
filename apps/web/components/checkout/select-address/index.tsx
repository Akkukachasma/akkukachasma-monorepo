"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LocationIcon from "@/components/icons/LocationIcon";
import SelectAddressModal from "./select-address-modal";
import { IAddress } from "@/components/account/addresses/Address";
import useUpdateOrderAddress from "@/lib/mutations/order/useUpdateOrderAddress";
import { useCheckout, isOrderCheckout } from "@/features/checkout";
import Link from "next/link";
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

const SelectAddress = () => {
  const { data, isGuest, isLoading } = useCheckout();
  const [selectedAddress, setSelectedAddress] = React.useState<IAddress>();
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingAddress, setPendingAddress] = React.useState<IAddress | null>(
    null,
  );
  const orderData = isOrderCheckout(data) ? data : null;
  const { mutateAsync: updateAddress } = useUpdateOrderAddress(
    orderData?.id || "",
  );

  const applyAddress = async (
    address: IAddress,
    acknowledgeUnverified = false,
  ) => {
    try {
      await updateAddress({
        address_id: address.id,
        ...(acknowledgeUnverified && {
          acknowledge_unverified_pincode: true,
        }),
      });
      setSelectedAddress(address);
      setOpen(false);
      setPendingAddress(null);
      setConfirmOpen(false);
    } catch (err) {
      if (isPincodeServiceabilityUnavailable(err) && !acknowledgeUnverified) {
        setPendingAddress(address);
        setConfirmOpen(true);
      }
    }
  };

  const handleUpdateAddress = (address: IAddress) => {
    void applyAddress(address);
  };

  React.useEffect(() => {
    if (orderData?.address) {
      setSelectedAddress(orderData.address);
    }
  }, [orderData?.address]);

  if (isLoading) {
    return <SelectAddressSkeleton />;
  }

  if (isGuest) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-bold text-base sm:text-lg">Shipping Address</div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <div className="text-gray-500 mb-2">
            <LocationIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Sign in to select delivery address
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create an account or sign in to add a shipping address and complete
            your order
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl"
            asChild
          >
            <Link href={`/login?from=${encodeURIComponent("/checkout")}`}>
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SelectAddressModal
        address={selectedAddress}
        setAddress={(address) => handleUpdateAddress(address)}
        open={open}
        onOpenChange={setOpen}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-base sm:text-lg">
        <span>Shipping Address</span>
        {selectedAddress && (
          <Button
            onClick={() => setOpen(true)}
            variant="secondary"
            size="xs"
            className="shrink-0 rounded-2xl"
          >
            Change
          </Button>
        )}
      </div>
      {selectedAddress && (
        <div className="flex flex-col rounded-xl border p-3 text-xs sm:p-4">
          <div className="font-medium capitalize">{selectedAddress.label}</div>
          <p className="mt-1 break-words text-foreground/90">
            {selectedAddress.address}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-foreground/80">
            <span>{selectedAddress.city}</span>
            <span>{selectedAddress.state}</span>
            <span>{selectedAddress.country}</span>
            <span>{selectedAddress.zip_code}</span>
          </div>
          <p className="text-xs font-normal text-gray-400">
            NOTE: <i>{selectedAddress.notes}</i>
          </p>
        </div>
      )}
      {!selectedAddress && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center">
          <div className="mb-2 text-gray-500">
            <LocationIcon />
          </div>
          <h3 className="mb-1 text-base font-medium text-gray-900 sm:text-lg">
            No shipping address selected
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Add a shipping address to continue with your order
          </p>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-2xl"
          >
            Add Address
          </Button>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delivery verification unavailable</AlertDialogTitle>
            <AlertDialogDescription>
              We temporarily can’t verify delivery for this pincode. You can
              still continue with this address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingAddress(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAddress) {
                  void applyAddress(pendingAddress, true);
                }
              }}
            >
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const SelectAddressSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-20 rounded-2xl" />
      </div>
      <div className="rounded-xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default SelectAddress;
