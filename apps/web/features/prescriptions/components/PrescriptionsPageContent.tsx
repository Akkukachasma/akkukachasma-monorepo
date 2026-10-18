"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import usePrescriptions from "@/lib/queries/account/usePrescriptions";
import PrescriptionsList from "./PrescriptionsList";
import PrescriptionEditDialog from "./PrescriptionEditDialog";
import { ClipboardList } from "lucide-react";

const PrescriptionsPageContent = () => {
  const { data: prescriptions, isLoading } = usePrescriptions();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" />
      </div>
    );
  }

  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    return (
      <>
        <div className="portal-empty mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <ClipboardList className="size-7" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              No saved prescriptions
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add a prescription to reuse it faster at checkout when you buy
              lenses.
            </p>
          </div>
          <Button
            className="min-h-10 touch-manipulation bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setCreateOpen(true)}
          >
            Add prescription
          </Button>
        </div>
        <PrescriptionEditDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-800 dark:text-sky-200">
          {prescriptions.length} saved
        </p>
        <Button
          size="sm"
          className="min-h-10 touch-manipulation bg-emerald-600 hover:bg-emerald-700 sm:min-h-9"
          onClick={() => setCreateOpen(true)}
        >
          Add prescription
        </Button>
      </div>
      <PrescriptionsList items={prescriptions} />
      <PrescriptionEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </>
  );
};

export default PrescriptionsPageContent;
