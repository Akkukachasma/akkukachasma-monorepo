"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ThemeModeSelectProps {
  className?: string;
  triggerClassName?: string;
  id?: string;
}

export function ThemeModeSelect({
  className,
  triggerClassName,
  id = "theme-mode-select",
}: ThemeModeSelectProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("h-9 min-w-[132px] rounded-md border border-border bg-muted/40", className)}
        aria-hidden
      />
    );
  }

  const value = theme ?? "system";

  return (
    <div className={cn("text-muted-foreground", className)}>
      <Select value={value} onValueChange={setTheme}>
        <SelectTrigger
          id={id}
          className={cn(
            "h-9 w-[min(100%,9rem)] border-border bg-background text-sm text-foreground",
            triggerClassName,
          )}
          aria-label="Color theme"
        >
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
