"use client";

import { Button } from "@/components/ui/button";
import useAddProductToCart from "@/features/select-lens/mutations/useAddProductToCart";
import { cn } from "@/lib/utils";

interface AddToCartFrameOnlyProps {
  product_color_id: string;
  disabled?: boolean;
  className?: string;
}

const AddToCartFrameOnly = ({
  product_color_id,
  disabled,
  className,
}: AddToCartFrameOnlyProps) => {
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
      size="lg"
      className={cn("px-6", className)}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
};

export default AddToCartFrameOnly;
