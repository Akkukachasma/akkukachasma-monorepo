"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { step: 1, label: "Power Type" },
  { step: 2, label: "Lens Feature" },
  { step: 3, label: "Lens Detail" },
  { step: 4, label: "Prescription" },
] as const;

interface PurchaseStepIndicatorProps {
  currentStep: number;
  className?: string;
}

const PurchaseStepIndicator: React.FC<PurchaseStepIndicatorProps> = ({
  currentStep,
  className,
}) => {
  return (
    <nav
      aria-label="Purchase progress"
      className={cn("flex items-center gap-2 overflow-x-auto py-3", className)}
    >
      {STEPS.map(({ step, label }, index) => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-shrink-0 items-center gap-2">
              <div
                className={cn(
                  "flex size-6 sm:size-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  !isCompleted && !isActive && "border-muted-foreground/40 text-muted-foreground",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isActive && "text-foreground",
                  isCompleted && "text-muted-foreground",
                  !isActive && !isCompleted && "text-muted-foreground/70",
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-4 flex-shrink-0 sm:w-6",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
                aria-hidden
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default PurchaseStepIndicator;
