"use client";
import React from "react";
import { Button } from "./ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface ShowingResultsProps {
  className?: string;
  query: string;
  onClose: () => void;
}

const ShowingResults: React.FC<ShowingResultsProps> = ({
  className = "",
  onClose,
  query,
}) => {
  if (!query) return <></>;
  return (
    <div
      className={cn("text-gray-400 mb-4 flex items-center gap-4", className)}
    >
      <div>
        Showing results for -
        <strong className="text-primary">&nbsp;{query}</strong>
      </div>

      <Button
        onClick={() => onClose()}
        variant="ghost"
        size="icon"
        className="text-destructive"
      >
        <Cross2Icon />
      </Button>
    </div>
  );
};

export default ShowingResults;
