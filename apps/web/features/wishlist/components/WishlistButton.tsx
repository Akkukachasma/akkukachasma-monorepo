"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useLoggedInUser from "@/features/auth/queries/useLoggedInUser";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import useAddToWishlist from "../mutations/useAddToWishlist";
import useRemoveWishlistByProduct from "../mutations/useRemoveWishlistByProduct";

export interface WishlistButtonProps {
  /** ProductColor (variant) id — same id as on listing cards / wishlist rows. */
  productColorId: string;
  initialWishlisted?: boolean;
  className?: string;
  isMobile?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productColorId,
  initialWishlisted = false,
  className,
  isMobile,
}) => {
  const router = useRouter();
  const { data: user, isFetched } = useLoggedInUser();
  const [wishlisted, setWishlisted] = React.useState(initialWishlisted);
  const [loginPromptOpen, setLoginPromptOpen] = React.useState(false);
  const add = useAddToWishlist();
  const remove = useRemoveWishlistByProduct();

  useEffect(() => {
    setWishlisted(!!initialWishlisted);
  }, [initialWishlisted]);

  const pending = add.isPending || remove.isPending;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isFetched) return;
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (pending) return;
    if (wishlisted) {
      remove.mutate(productColorId, {
        onSuccess: () => setWishlisted(false),
      });
    } else {
      add.mutate(
        { product_color_id: productColorId },
        {
          onSuccess: () => setWishlisted(true),
        },
      );
    }
  };

  return (
    <>
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent showCloseIcon className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to use your wishlist</DialogTitle>
            <DialogDescription className="text-left">
              Save products you love and come back to them anytime. Sign in to
              your account to add items to your wishlist. If you do not have an
              account yet, you can create one from the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoginPromptOpen(false)}
            >
              Not now
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLoginPromptOpen(false);
                router.push("/login");
              }}
            >
              Go to login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        onClick={onClick}
        disabled={pending}
        size="icon"
        variant={isMobile ? "default" : "ghost"}
        className={cn("flex-shrink-0", isMobile && "shadow-none bg-white text-foreground rounded-full", className)}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          {...(wishlisted && { fill: "currentColor" })}
          className={cn(
            "animate-smooth text-muted-foreground",
            wishlisted && "text-destructive",
          )}
        />
      </Button>
    </>
  );
};

export default WishlistButton;
