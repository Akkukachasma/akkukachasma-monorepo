"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

/** Button group for theme — avoids Radix Select portal inside Sheet. */
export default function MobileThemePicker() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="h-10 w-full rounded-md border border-border bg-muted/40"
        aria-hidden
      />
    );
  }

  const active = theme ?? "system";

  return (
    <div className="flex gap-2" role="group" aria-label="Color theme">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
            active === value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted/80",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
