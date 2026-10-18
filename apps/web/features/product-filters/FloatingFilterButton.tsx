"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FloatingFilterButtonProps {
  onClick: () => void;
  filterCount?: number;
  className?: string;
}

const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({
  onClick,
  filterCount = 0,
  className,
}) => {
  return (
    <Button
      size="lg"
      variant="default"
      onClick={onClick}
      className={cn(
        "fixed bottom-3.5 sm:bottom-12 right-[70px] sm:right-44 z-40 size-10 sm:size-14 rounded-full shadow-lg md:size-12",
        "flex items-center justify-center p-0",
        className
      )}
      aria-label="Open filters"
    >
      <SlidersHorizontal className="size-4 sm:size-6" />
      {filterCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -top-1 -right-1 size-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {filterCount}
        </Badge>
      )}
    </Button>
  );
};

export default FloatingFilterButton;
