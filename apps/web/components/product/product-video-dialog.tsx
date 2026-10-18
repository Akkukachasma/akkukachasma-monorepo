"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductEmbeddingPlayer, {
  type ProductEmbeddingPlayerHandle,
} from "./product-embedding-player";

type ProductVideoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  title?: string;
};

export default function ProductVideoDialog({
  open,
  onOpenChange,
  src,
  title = "Product video",
}: ProductVideoDialogProps) {
  const playerRef = React.useRef<ProductEmbeddingPlayerHandle>(null);

  React.useEffect(() => {
    if (!open) {
      playerRef.current?.seekToStart();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        allowPointerDismissal
        className="max-w-5xl w-[min(96vw,1100px)] border-0 bg-black/95 p-0 shadow-2xl sm:rounded-2xl"
        showCloseIcon
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative w-full p-2 sm:p-4">
          <ProductEmbeddingPlayer
            ref={playerRef}
            src={src}
            playing={open}
            muted
            loop
            controls={false}
            preload="auto"
            wrapperClassName="rounded-xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
