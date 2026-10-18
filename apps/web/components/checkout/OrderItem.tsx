"use client";
import React from "react";
import { IFile } from "@/lib/types";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Cable, PencilRuler } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setItemToDelete as setCheckoutItemToDelete } from "@/store/checkout.slice";
import { setItemToDelete as setCartItemToDelete } from "@/store/cart.slice";
import PrescriptionDetails from "../cart/PrescriptionDetails";
import { ICartItem } from "../cart/CartItem";
import DeleteOrderItemModal from "./DeleteOrderItemModal";

interface ICartItemProps {
  item?: ICartItem;
  /**
   * this is not order.order_id. it is order.id
   */
  order_id?: string;
  /** When true, remove dispatches to cart (guest checkout). */
  isGuest?: boolean;
}

const OrderItem: React.FC<ICartItemProps> = ({ item, order_id, isGuest }) => {
  const dispatch = useAppDispatch();

  if (!item) {
    return (
      <div className="relative w-full min-w-0 overflow-hidden rounded-md border">
        <div className="absolute right-2 top-2 z-10 flex text-xs tracking-wide">
          <Skeleton className="h-8 w-16 bg-destructive/10" />
        </div>
        <div className="p-3 pt-10 sm:p-4">
          <div className="flex flex-col gap-4 py-2 sm:flex-row sm:gap-5">
            <Skeleton className="mx-auto aspect-[7/3] w-full max-w-[14rem] sm:h-24" />
            <div className="space-y-2 text-sm tracking-wide">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <hr className="my-3 sm:my-4" />
          <div className="space-y-2">
            <div className="flex flex-col gap-2 px-1 text-sm sm:flex-row sm:items-center sm:gap-6 sm:px-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl =
    item.product_color.images?.find(
      (i: { fieldname?: string }) => i.fieldname === "thumbnail",
    )?.url ??
    (item.product_color as { thumbnail?: string }).thumbnail ??
    "";

  return (
    <React.Fragment>
      <DeleteOrderItemModal />
      <div className="relative w-full min-w-0 overflow-hidden rounded-md border">
        <div className="absolute right-2 top-2 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              isGuest
                ? dispatch(
                    setCartItemToDelete({
                      id: item.id,
                      label: item.product_color.product.model_name,
                    }),
                  )
                : dispatch(
                    setCheckoutItemToDelete({
                      id: item.id,
                      label: item.product_color.product.model_name,
                      data: { id: order_id || "" },
                    }),
                  )
            }
            className="h-8 px-2 py-0 text-xs font-medium !bg-transparent text-orange-600 hover:text-indigo-500 sm:text-sm"
          >
            Remove
          </Button>
        </div>
        <div className="p-3 pt-10 sm:p-4 sm:pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <Image
              src={thumbnailUrl}
              width={500}
              height={350}
              alt="Order item"
              className="mx-auto aspect-[7/3] h-auto w-full max-w-[14rem] shrink-0 object-contain sm:mx-0 sm:h-24 sm:max-w-[14rem]"
            />
            <div className="min-w-0 flex-1 space-y-2 text-sm tracking-wide">
              <div className="space-y-1 pr-14 sm:pr-0">
                <p className="font-medium leading-snug">
                  {item.product_color.product.model_name}
                </p>
                {!item.frame_only && item.lens_detail && (
                  <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{item.power_type?.title}</span>
                    <span className="inline-block h-1 w-1 shrink-0 self-center rounded-full bg-muted-foreground" />
                    <span>{item.lens_detail.title}</span>
                    <span className="inline-block h-1 w-1 shrink-0 self-center rounded-full bg-muted-foreground" />
                    <span>{item.lens_feature?.title}</span>
                  </p>
                )}
              </div>
              <p className="font-semibold">Rs {item.price}</p>
            </div>
          </div>
          <hr className="my-3 sm:my-4" />
          <div className="space-y-2">
            <div className="flex flex-col gap-2 px-1 text-sm sm:flex-row sm:items-center sm:gap-6 sm:px-2">
              <p className="inline-flex items-center gap-1 tracking-wide">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <PencilRuler className="size-4 shrink-0" /> Size:
                </span>
                {item.product_color.product.frame_width || 0} mm
              </p>
              {!item.frame_only && (
                <p className="inline-flex items-center gap-1 font-semibold tracking-wide">
                  <Cable className="size-4 shrink-0" />
                  Power Submitted
                </p>
              )}
            </div>
            {!item.frame_only && (
              <div className="-mx-1 max-h-[160px] overflow-x-auto rounded-md border sm:mx-0">
                <PrescriptionDetails data={item.prescription} />
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default OrderItem;
