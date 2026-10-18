"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { DialogCloseButton } from "./dialog-close";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, onPointerDown, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    onPointerDown={(e) => {
      onPointerDown?.(e);
      e.stopPropagation();
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseIcon?: boolean;
  /** When true, outside pointer / focus interactions may dismiss the dialog (default false). */
  allowPointerDismissal?: boolean;
}
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      showCloseIcon = true,
      allowPointerDismissal = false,
      children,
      onPointerDown,
      onClick,
      onInteractOutside,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 grid w-full gap-4 border border-border bg-background p-2 sm:p-6 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[100vh] overflow-auto",
          "left-[50%] top-[50%] max-w-lg translate-x-[-50%] translate-y-[-50%] sm:rounded-lg",
          className,
        )}
        onInteractOutside={(e) => {
          onInteractOutside?.(e);
          if (!allowPointerDismissal && !e.defaultPrevented) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          onPointerDownOutside?.(e);
          if (!allowPointerDismissal && !e.defaultPrevented) {
            e.preventDefault();
          }
        }}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          e.stopPropagation();
        }}
        onClick={(e) => {
          onClick?.(e);
          e.stopPropagation();
        }}
        {...props}
      >
        {children}
        {showCloseIcon ? (
          <DialogCloseButton className="absolute right-4 top-4" />
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 font-semibold text-black/70 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

type DialogHeaderWithCloseProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  description?: React.ReactNode;
};

/**
 * Header with built-in top-right close. Use with `DialogContent` when `showCloseIcon={false}`.
 */
function DialogHeaderWithClose({
  title,
  description,
  className,
  ...props
}: DialogHeaderWithCloseProps) {
  return (
    <DialogHeader
      className={cn("relative pr-10 text-center sm:text-left", className)}
      {...props}
    >
      <DialogTitle>{title}</DialogTitle>
      {description ? (
        <DialogDescription>{description}</DialogDescription>
      ) : null}
      <DialogCloseButton className="absolute right-0 top-0" />
    </DialogHeader>
  );
}

export { DialogCloseButton } from "./dialog-close";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogHeaderWithClose,
};
