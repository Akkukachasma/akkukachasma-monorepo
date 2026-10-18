"use client";
import React from "react";
import Offer from "./Offer";
import useOffers from "@/lib/queries/offers/useOffers";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { TicketPercent } from "lucide-react";
const OfferList = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOffers();
  const elementRef = useInfiniteScroll({
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  if (isLoading || !Array.isArray(data)) {
    return (
      <div className="h-full">
        {Array(8)
          .fill("")
          .map((_, index) => (
            <Offer key={index} />
          ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-muted-foreground">
        <TicketPercent className="size-12" />
        <p className="text-lg font-semibold">No offers available</p>
        <p className="max-w-xs text-sm text-muted-foreground/70">
          Sorry, we don't have any offers or coupons right now. Please check
          back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((data, index) => (
        <Offer ref={elementRef} key={index} data={data} />
      ))}
    </div>
  );
};
export default OfferList;
