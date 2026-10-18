"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import type { Activity } from "../queries/useGetActivities";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  INFO: "bg-slate-100 text-slate-800 border-slate-200",
  SUCCESS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ERROR: "bg-red-50 text-red-800 border-red-200",
  WARNING: "bg-amber-50 text-amber-800 border-amber-200",
  ALERT: "bg-orange-50 text-orange-800 border-orange-200",
};

interface ActivityDetailModalProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

const ActivityDetailModal = ({
  activity,
  open,
  onOpenChange,
}: ActivityDetailModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!activity) return null;

  const typeStyle = TYPE_STYLES[activity.type ?? "INFO"] ?? TYPE_STYLES.INFO;
  const detailJson = JSON.stringify(activity.detail ?? {}, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(detailJson);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Detail JSON has been copied.",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        showCloseIcon
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4 pr-12">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold">
                {activity.title ?? "Activity"}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    typeStyle
                  )}
                >
                  {activity.type}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(activity.created_at)}
                </span>
                {activity.user && (
                  <span className="text-sm text-muted-foreground">
                    · {activity.user.name}
                  </span>
                )}
              </div>
              {activity.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Detail (JSON)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
              {detailJson}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailModal;
