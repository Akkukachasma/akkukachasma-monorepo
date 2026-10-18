"use client";
import { ICartItem } from "../cart/CartItem";
import { ICalculation } from "../cart/CartItems";
import { IUser } from "@/lib/types";
import { notFound } from "next/navigation";
import OrderItem from "./OrderItem";
import { IAddress } from "../account/addresses/Address";
import { useCheckout, isOrderCheckout } from "@/features/checkout";
import DeleteOrderItemModal from "./DeleteOrderItemModal";
import DeleteCartItemModal from "../cart/DeleteCartItemModal";
import { Skeleton } from "../ui/skeleton";

export type OrderStatus = "initiated" | "confirmed" | "picked" | "delivered";
type PaymentStatus = "pending" | "completed" | "failed";
type PaymentMode = "cod" | "online";
export interface IPayment {
  id: string;
  mode: PaymentMode;
  status: PaymentStatus;
  amount: number;
}
export interface IGetCheckoutResponse {
  id: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  notes: string | null;
  deleted_at: string | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  picked_at: string | null;
  delivered_at: string | null;
  user_id: string;
  pricing: ICalculation & { id: string };
  order_items: (ICartItem & { taxes?: any[] })[];
  payment: IPayment;
  address: IAddress;
  saving: number;
  gst_breakdown?: {
    total_gst: number;
    cgst: number;
    sgst: number;
    igst: number;
    rounded_by?: number;
  };
  user: IUser;
}

const OrderItems = () => {
  const { data, isLoading, isGuest } = useCheckout();

  if (isLoading) {
    return <OrderItemsSkeleton />;
  }

  const items = isOrderCheckout(data)
    ? data?.order_items ?? []
    : data?.cart_items ?? [];
  const orderId = isOrderCheckout(data) ? data?.id : undefined;

  if (!items?.length) {
    notFound();
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-4 md:col-span-7 lg:col-span-6">
      <DeleteCartItemModal />
      <DeleteOrderItemModal />
      {items.map((item) => (
        <OrderItem
          key={item.id}
          item={item}
          order_id={orderId}
          isGuest={isGuest}
        />
      ))}
    </div>
  );
};

const OrderItemsSkeleton = () => {
  return (
    <div className="flex min-w-0 w-full flex-col gap-4 md:col-span-7 lg:col-span-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-xl border p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <Skeleton className="mx-auto aspect-[7/3] w-full max-w-[14rem] sm:h-24" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItems;
