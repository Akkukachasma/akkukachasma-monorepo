"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const dialogCloseButtonClass = cn(
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity",
  "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
);

export const DialogCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    type="button"
    className={cn(dialogCloseButtonClass, className)}
    {...props}
  >
    {children ?? (
      <>
        <Cross2Icon className="h-4 w-4 text-destructive" aria-hidden />
        <span className="sr-only">Close</span>
      </>
    )}
  </DialogPrimitive.Close>
));
DialogCloseButton.displayName = "DialogCloseButton";
