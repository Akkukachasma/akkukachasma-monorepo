"use client";

import { Button } from "@/components/ui/button";
import useAddresses from "@/lib/queries/account/useAddresses";
import { useAppDispatch } from "@/store";
import { openCreateAddressModal } from "@/store/account.slice";
import Address from "./Address";
import { MapPin, Plus } from "lucide-react";

const Addresses = () => {
  const dispatch = useAppDispatch();
  const { data: addresses, isLoading } = useAddresses();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" />
      </div>
    );
  }

  if (!Array.isArray(addresses)) {
    return (
      <div className="grid h-full place-content-center px-2">
        <div className="portal-empty mx-auto max-w-md">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <MapPin className="size-7" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            You don&apos;t have any address.
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Add an address now. It will appear to select when checking out for
            an order.
          </p>
          <Button
            onClick={() => dispatch(openCreateAddressModal())}
            size="sm"
            className="mt-4 min-h-10 touch-manipulation rounded-2xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-1.5 size-4" />
            Add Address
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => dispatch(openCreateAddressModal())}
          size="sm"
          className="min-h-10 touch-manipulation rounded-2xl bg-emerald-600 px-3 hover:bg-emerald-700 sm:min-h-9"
        >
          <Plus className="size-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Create New Address</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 3xl:grid-cols-4">
        {addresses?.map((address, index) => (
          <Address key={address.id} index={index} data={address} />
        ))}
      </div>
    </div>
  );
};

export default Addresses;
