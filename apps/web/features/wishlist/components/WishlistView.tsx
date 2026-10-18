"use client";

import CustomerHeaderWrapper from "@/features/customer/components/CustomerHeaderWrapper";
import { Button } from "@/components/ui/button";
import ProductCard2 from "@/features/products/components/cards/ProductCard2";
import ProductCardSkeleton from "@/features/products/components/cards/ProductCardSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, X, AlertCircle } from "lucide-react";
import useWishlist from "../queries/useWishlist";
import useClearWishlist from "../mutations/useClearWishlist";
import useRemoveWishlistItem from "../mutations/useRemoveWishlistItem";
import EmptyWishlist from "./EmptyWishlist";
import { EmptyState } from "@/components/empty-state";

const WishlistView = () => {
  const { data: rows = [], isLoading, isError, refetch } = useWishlist();
  const clearWishlist = useClearWishlist();
  const removeItem = useRemoveWishlistItem();

  if (isError) {
    return (
      <div className="flex h-full flex-col">
        <CustomerHeaderWrapper title="My Wishlist" className="flex-shrink-0" />
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your wishlist"
          description="Something went wrong while fetching your saved items. Please try again."
          className="min-h-[50vh]"
        >
          <Button
            type="button"
            className="rounded-3xl"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </EmptyState>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <CustomerHeaderWrapper title="My Wishlist" className="flex-shrink-0" />
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <CustomerHeaderWrapper title="My Wishlist" className="flex-shrink-0" />
        <EmptyWishlist />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CustomerHeaderWrapper
        title="My Wishlist"
        tagline={`${rows.length} items in wishlist`}
        className="flex-shrink-0"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Wishlist
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear your wishlist?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove every saved item from your wishlist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clearWishlist.mutate()}
                disabled={clearWishlist.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CustomerHeaderWrapper>
      <div className="grid flex-grow grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, index) => (
          <div className="relative" key={row.wishlist_id}>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 z-20 h-10 w-10 rounded-full shadow-md"
              aria-label="Remove from wishlist"
              disabled={removeItem.isPending}
              onClick={() => removeItem.mutate(row.wishlist_id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <ProductCard2 index={index} data={row.item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistView;
