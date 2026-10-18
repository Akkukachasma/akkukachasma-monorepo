"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  size?: "sm" | "md" | "lg"; // Small, Medium, Large sizes
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-8",
    md: "h-6 w-12",
    lg: "h-8 w-16",
  };

  const thumbSizeClasses = {
    sm: "h-3 w-3 data-[state=checked]:translate-x-4",
    md: "h-4 w-4 data-[state=checked]:translate-x-6",
    lg: "h-6 w-6 data-[state=checked]:translate-x-8",
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        sizeClasses[size],
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
          thumbSizeClasses[size],
        )}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
