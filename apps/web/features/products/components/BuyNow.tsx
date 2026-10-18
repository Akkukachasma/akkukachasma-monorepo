"use client";

import { Button } from "@/components/ui/button";
import useCheckout from "@/features/select-lens/mutations/useCheckout";
import useAddProductToCart from "@/features/select-lens/mutations/useAddProductToCart";
import { useLoggedInUser } from "@/features/auth";
import { cn } from "@/lib/utils";

interface BuyNowProps {
  product_color_id: string;
  disabled?: boolean;
  className?: string;
}

const BuyNow = ({ product_color_id, disabled, className }: BuyNowProps) => {
  const { data: user, isLoading: authLoading } = useLoggedInUser();
  const isGuest = !authLoading && !user;


  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddProductToCart();

  const isPending = isCheckingOut || isAddingToCart;

  const handleClick = () => {
    const payload = {
      product_color_id,
      frame_only: true,
      save_prescription: false,
    };
    // Use addToCart when guest or auth still loading — checkout() requires auth
    // and would 401 for guests. addToCart works for both and redirects to checkout.
    if (isGuest || authLoading) {
      
      addToCart({ ...payload, redirectTo: "checkout" });
    } else {
      checkout(payload);
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      className={cn("px-6", className)}
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {isPending ? "Processing..." : "Buy Now"}
    </Button>
  );
};

export default BuyNow;
