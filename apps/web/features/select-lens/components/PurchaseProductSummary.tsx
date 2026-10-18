"use client";

import { IProductColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface PurchaseProductSummaryProps {
  productColor: IProductColor | undefined;
  productModelName?: string;
  className?: string;
}

const PurchaseProductSummary: React.FC<PurchaseProductSummaryProps> = ({
  productColor,
  productModelName,
  className,
}) => {
  const thumbnail = productColor?.images?.find(
    (img) => img.fieldname === "thumbnail",
  );
  const imageUrl = thumbnail?.url;
  const modelName =
    productModelName ??
    (productColor as { product?: { model_name?: string } })?.product?.model_name;

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center gap-3 rounded-lg bg-muted/30",
        className,
      )}
    >
      <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={modelName ?? "Selected frame"}
            width={56}
            height={56}
            className="object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <span className="text-xs">Frame</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{modelName ?? "Your frame"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {productColor?.model_number}
        </p>
      </div>
    </div>
  );
};

export default PurchaseProductSummary;
