"use client";

import React from "react";
import { Button } from "../ui/button";
import useAddProductToCart from "@/features/select-lens/mutations/useAddProductToCart";
import { cn } from "@/lib/utils";

interface PurchaseFrameOnlyProps {
  product_color_id: string;
  disabled?: boolean;
  isMobile?: boolean;
  /** When set (e.g. mobile sticky bar), overrides default mobile width rules. */
  className?: string;
}

const PurchaseFrameOnly = ({
  product_color_id,
  disabled,
  isMobile,
  className,
}: PurchaseFrameOnlyProps) => {
  const { mutate: addToCart, isPending } = useAddProductToCart();

  const handleClick = () => {
    addToCart({
      product_color_id,
      frame_only: true,
      save_prescription: false,
    });
  };

  return (
    <Button
      variant="secondary"
      size={className ? "lg" : isMobile ? "sm" : "lg"}
      title="Buy only frame excluding lenses"
      className={cn(
        "px-6",
        isMobile && !className && "!w-fit",
        className,
      )}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {isPending ? "Adding..." : "Frame Only"}
    </Button>
  );
};
export default PurchaseFrameOnly;
