"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicPagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page error:", error.message);
  }, [error]);

  return (
    <div className="app-container min-h-[50vh] flex flex-col items-center justify-center gap-6 py-16">
      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        We couldn’t load this page. Please try again.
      </p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
