"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast({
      title: "Failed to load search results",
      description: error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    });
  }, [error]);

  return (
    <div className="app-container min-h-[60vh] flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-muted-foreground text-center">
        Unable to load search results. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
