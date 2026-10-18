"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/lib/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import PriceAdjustmentForm from "@/features/admin/settings/pricing/components/PriceAdjustmentForm";
import PriceAdjustmentHistory from "@/features/admin/settings/pricing/components/PriceAdjustmentHistory";
import useCreatePriceAdjustment from "@/features/admin/settings/pricing/mutations/useCreatePriceAdjustment";
import usePriceAdjustments, {
  hasInProgressPriceAdjustment,
} from "@/features/admin/settings/pricing/queries/usePriceAdjustments";
import type { PriceAdjustmentFormValues } from "@/features/admin/settings/pricing/pricing.schema";

const PricingSettingsPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<PriceAdjustmentFormValues | null>(
    null,
  );
  const wasInProgress = useRef(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = usePriceAdjustments(1, 50);
  const createAdjustment = useCreatePriceAdjustment();
  const jobInProgress = hasInProgressPriceAdjustment(data?.data);
  const submitDisabled = createAdjustment.isPending || jobInProgress;

  useEffect(() => {
    if (wasInProgress.current && !jobInProgress) {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Price adjustment finished",
        description: "Product prices and history have been updated.",
      });
    }
    wasInProgress.current = jobInProgress;
  }, [jobInProgress, queryClient]);

  const handleFormSubmit = (values: PriceAdjustmentFormValues) => {
    setPending(values);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!pending || submitDisabled) return;
    createAdjustment.mutate(pending, {
      onSuccess: () => {
        setConfirmOpen(false);
        setFormOpen(false);
        setPending(null);
      },
    });
  };

  const confirmLabel = pending
    ? pending.mode === "percentage"
      ? `${pending.direction} all frame prices by ${pending.value}%`
      : `${pending.direction} all frame prices by ₹${pending.value}`
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Adjust product prices</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Bulk increase or decrease MRP and selling price for all frame
              products. Lenses are excluded.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} disabled={jobInProgress}>
            {jobInProgress ? "Adjustment in progress…" : "Open form"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Percentage values cannot exceed 100. Fixed amounts must be positive.
            Prices that would fall to zero or below are clamped to ₹0.01.
            {jobInProgress
              ? " A bulk adjustment is currently running; wait for it to finish before starting another."
              : ""}
          </p>
        </CardContent>
      </Card>

      <PriceAdjustmentHistory
        items={data?.data ?? []}
        isLoading={isLoading}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk price adjustment</DialogTitle>
          </DialogHeader>
          <PriceAdjustmentForm
            onSubmit={handleFormSubmit}
            isSubmitting={submitDisabled}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply price adjustment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {confirmLabel}. All frame products will be updated in
              the background and an audit entry will be saved. This cannot be
              undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createAdjustment.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={submitDisabled}
            >
              {createAdjustment.isPending ? "Starting…" : "Apply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PricingSettingsPage;
