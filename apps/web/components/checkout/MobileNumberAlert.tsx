"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLoggedInUser } from "@/features/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mobile-number-alert-dismissed";

const MobileNumberAlert = () => {
  const { data: user, isLoading } = useLoggedInUser();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* sessionStorage may be unavailable */
    }
  }, []);

  if (isLoading || !user) return null;

  const phone = user.phone_number?.trim();
  if (phone) return null;
  if (dismissed) return null;

  const persistDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) persistDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mobile Number Required</DialogTitle>
          <DialogDescription>
            Please add your mobile number before placing the order.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={persistDismiss}>
            Not now
          </Button>
          <Button asChild>
            <Link href="/customers/account">Add Phone Number</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MobileNumberAlert;
