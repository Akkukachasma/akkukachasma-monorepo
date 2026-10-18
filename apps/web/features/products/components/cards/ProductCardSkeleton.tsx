import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={cn(
        "block border relative h-full w-full max-w-[400px] rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Image area */}
      <Skeleton className="w-full h-[230px] rounded-none" />

      {/* Badge skeleton */}
      <Skeleton className="absolute top-4 left-4 z-[10] h-6 w-14 rounded" />

      {/* Wishlist button skeleton */}
      <Skeleton className="absolute top-4 right-4 z-[10] size-9 rounded-full" />

      <div className="px-4 pt-2 pb-4 space-y-3">
        {/* Specs row */}
        <div className="flex items-center gap-2 justify-between">
          <div className="grid place-content-center text-center">
            <Skeleton className="h-3 w-10 mx-auto mb-1" />
            <Skeleton className="h-2 w-16 mx-auto" />
          </div>
          <div className="grid place-content-center text-center">
            <Skeleton className="h-3 w-10 mx-auto mb-1" />
            <Skeleton className="h-2 w-14 mx-auto" />
          </div>
          <div className="grid place-content-center text-center">
            <Skeleton className="h-3 w-8 mx-auto mb-1" />
            <Skeleton className="h-2 w-12 mx-auto" />
          </div>
        </div>

        {/* Separator */}
        <Skeleton className="h-px w-full my-1" />

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="size-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};

ProductCardSkeleton.displayName = "ProductCardSkeleton";
export default ProductCardSkeleton;
