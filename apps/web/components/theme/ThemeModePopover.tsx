"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const options = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export interface ThemeModePopoverProps {
  className?: string;
}

export function ThemeModePopover({ className }: ThemeModePopoverProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = !mounted
    ? Sun
    : resolvedTheme === "dark"
      ? Moon
      : Sun;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("shrink-0", className)}
          aria-label="Color theme"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="end" sideOffset={8}>
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
          Appearance
        </p>
        <div className="flex flex-col gap-0.5">
          {options.map(({ value, label, icon: OptionIcon }) => (
            <Button
              key={value}
              type="button"
              variant={theme === value ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2 font-normal"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
            >
              <OptionIcon className="h-4 w-4 shrink-0" />
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
