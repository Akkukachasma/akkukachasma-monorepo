"use client";
import React from "react";
import { ICoupon } from "../coupon-manager/ListItem";
import { cn } from "@/lib/utils";
import {
  BadgeIndianRupee,
  CalendarDays,
  Check,
  Copy,
  Gift,
  Percent,
} from "lucide-react";
import dayjs from "dayjs";
import { Button } from "../ui/button";
import useCopy from "@/lib/hooks/useCopy";
interface OfferProps {
  data?: ICoupon;
}
const Offer = React.forwardRef<HTMLDivElement, OfferProps>(({ data }, ref) => {
  const [selected, onSelect] = React.useState(false);
  const { copyText, isCopied } = useCopy();

  if (!data) {
    return <div>loading...</div>;
  }

  return (
    <div
      className={cn(
        "relative flex max-w-md w-full rounded-xl border border-border bg-card shadow-md transition-shadow hover:shadow-lg",
        selected && "border-primary ring-2 ring-primary",
      )}
    >
      {/* Left side tag with discount */}
      <div
        className={cn(
          "flex flex-col flex-shrink-0 items-center justify-center rounded-l-xl px-4 py-6 min-w-[120px]",
          data.discount_type === "PERCENT" ? "bg-primary" : "bg-primary/80",
        )}
      >
        {data.discount_type === "PERCENT" ? (
          <Percent className="h-8 w-8 text-white" />
        ) : (
          <BadgeIndianRupee className="h-8 w-8 text-white" />
        )}
        <span className="mt-2 text-white text-lg font-bold">
          {data.discount_type === "PERCENT"
            ? `${data.discount_value}%`
            : `₹${data.discount_value.toFixed(2)}`}
        </span>
        <span className="text-white text-xs uppercase tracking-wider mt-1">
          Off
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
          <h3 className="text-2xl inline-flex items-center gap-2 font-semibold text-foreground uppercase">
            <span>{data.name}</span>
            <Button
              type="button"
              onClick={() => copyText(data.name)}
              variant={isCopied ? "success" : "ghost"}
              size="icon"
              className="size-6"
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </h3>
          <div className="text-sm text-muted-foreground">
            {data.discount_type === "PERCENT" ? (
              <p>
                Enjoy a flat discount of {data.discount_value}% on your total
                order amount — a great way to save more today!
              </p>
            ) : (
              <p>
                You're getting an instant ₹{data.discount_value.toFixed(2)} off
                on this order — no conditions, just pure savings!
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center flex-wrap text-sm text-muted-foreground mt-2 gap-2">
          <div
            title="Offer only valid in this span"
            className="flex items-center"
          >
            <CalendarDays className="h-4 w-4" />
            <span>
              {dayjs(data.valid_from).format("MMM DD, YYYY")} -{" "}
              {dayjs(data.valid_till).format("MMM DD, YYYY")}
            </span>
          </div>
          <div
            title={`Your order should be atleast worth ₹${data.minimum_order}.`}
            className="flex items-center"
          >
            <Gift className="h-4 w-4" />
            <span>Min order ₹{data.minimum_order}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
Offer.displayName = "Offer";
export default Offer;
