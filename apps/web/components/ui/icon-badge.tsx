import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  variant?: "default" | "secondary" | "outline";
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  label,
  variant = "default",
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center space-x-2 rounded-full px-4 py-2 transition-colors",
        {
          "bg-accent/50 hover:bg-accent": variant === "default",
          "bg-secondary hover:bg-secondary/80": variant === "secondary",
          "border border-border hover:bg-accent/50": variant === "outline",
        },
        className,
      )}
      {...props}
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};
