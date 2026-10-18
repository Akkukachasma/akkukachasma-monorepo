"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type DialogFooterActionsProps = React.ComponentProps<
  typeof DialogFooter
> & {
  cancelLabel?: string;
  /** When set, invoked instead of a default DialogClose cancel control. */
  onCancel?: () => void;
  children: React.ReactNode;
};

/**
 * Standard footer row: outline cancel (closes dialog unless `onCancel` is used) + primary actions.
 */
export function DialogFooterActions({
  cancelLabel = "Cancel",
  onCancel,
  children,
  className,
  ...footerProps
}: DialogFooterActionsProps) {
  return (
    <DialogFooter className={cn(className)} {...footerProps}>
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      ) : (
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {cancelLabel}
          </Button>
        </DialogClose>
      )}
      {children}
    </DialogFooter>
  );
}
