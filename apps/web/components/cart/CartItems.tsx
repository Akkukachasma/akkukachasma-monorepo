"use client";
import useFetch from "@/lib/hooks/use-fetch";
import CartItem, { ICartItem } from "./CartItem";
import ENDPOINTS from "@/lib/endpoints";
import { ICoupon } from "../coupon-manager/ListItem";
import { ShoppingCart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { EmptyState } from "@/components/empty-state";

export interface ICalculation {
  base_subtotal: number;
  subtotal: number;
  discount_on_mrp: number;
  lens_detail_price: number;
  shipping_price: number;
  total: number;
  applied_coupon?: {
    coupon: ICoupon | null;
    discount: number;
  };
}
export interface ICartSummary {
  subtotal: number;
  estimated_total: number;
}

export interface IGetCartResponse {
  cart_items: Array<ICartItem>;
  coupon: ICoupon | null;
  checkout_initiated: boolean;
  summary?: ICartSummary;
}

const EmptyCartState = () => (
  <EmptyState
    icon={ShoppingCart}
    title="Your cart is empty"
    description="Looks like you haven't added anything to your cart yet."
    className="min-h-[50vh]"
  >
    <Button asChild className="rounded-3xl">
      <Link href="/categories">Continue shopping</Link>
    </Button>
  </EmptyState>
);

const CartErrorState = () => (
  <EmptyState
    icon={AlertCircle}
    title="Couldn't load your cart"
    description="Something went wrong while fetching your cart. Please try again."
    className="min-h-[50vh]"
  >
    <Button
      type="button"
      className="rounded-3xl"
      onClick={() => window.location.reload()}
    >
      Try again
    </Button>
  </EmptyState>
);

const CartItems = () => {
  const { data, isLoading, isError } = useFetch<IGetCartResponse>({
    endpoint: ENDPOINTS.cart.fetch_items,
  });

  if (isLoading && !Array.isArray(data?.cart_items)) {
    return (
      <div className="flex w-full flex-col gap-4">
        {Array(4)
          .fill("")
          .map((_, index) => (
            <CartItem key={index} />
          ))}
      </div>
    );
  }

  if (isError || !data) {
    return <CartErrorState />;
  }

  if (data.cart_items?.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {data.cart_items.map((item) => {
        return <CartItem key={item.id} item={item} />;
      })}
    </div>
  );
};
export default CartItems;
