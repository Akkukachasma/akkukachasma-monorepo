"use client";

import { LucideIcon, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable empty/not-found component for lists and data views.
 * Use when a list or search returns no results.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
        className
      )}
    >
      <div className="rounded-full bg-muted/60 p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
