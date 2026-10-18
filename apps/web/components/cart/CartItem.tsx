"use client";
import React, { useState } from "react";
import { IFile } from "@/lib/types";
import Image from "next/image";
import { IProduct } from "../products/ListItem";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Cable, PencilRuler } from "lucide-react";
import PrescriptionDetails from "./PrescriptionDetails";
import { z } from "zod";
import { useAppDispatch } from "@/store";
import { quantityUpdateSettled, setItemToDelete } from "@/store/cart.slice";
import DeleteCartItemModal from "./DeleteCartItemModal";
import { prescriptionSchema } from "@/features/select-lens/purchase.schema";
import QuantityInput from "../ui/quantity-input";
import { useDebounce } from "@/hooks/use-debounce";
import { useUpdateItemQuantity } from "@/features/cart";

export interface ICartItem {
  id: string;
  cart_id: string;
  product_color_id: string;
  power_type_id?: string | null;
  lens_feature_id?: string | null;
  lens_detail_id?: string | null;
  frame_only: boolean;
  prescription: z.infer<typeof prescriptionSchema>;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  lens_detail?: {
    title: string;
    price: number;
    id: string;
    anti_reflection: boolean;
    blue_light_blocker: boolean;
    hydrophobic: number;
    uv_protection: boolean;
  } | null;
  lens_feature?: {
    id: string;
    title: string;
  } | null;
  power_type?: {
    id: string;
    title: string;
  } | null;
  product_color: {
    images: Array<IFile>;
    product: IProduct;
  };
}

interface ICartItemProps {
  item?: ICartItem;
}

const CartItem: React.FC<ICartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const serverQuantity = item?.quantity ?? 1;
  const [quantity, setQuantity] = useState<number>(serverQuantity);
  const { mutate: updateItemQuantity, isPending: updatingQuantity } =
    useUpdateItemQuantity(item?.id || "");

  // Sync local state when server data changes (e.g. after refetch or revert on error)
  React.useEffect(() => {
    setQuantity(serverQuantity);
  }, [serverQuantity]);

  const updateQuantity = useDebounce<number>((value) => {
    updateItemQuantity(
      { quantity: value },
      {
        onError: () => {
          setQuantity(serverQuantity);
          dispatch(quantityUpdateSettled());
        },
      },
    );
  }, 1000);

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    updateQuantity(value);
  };

  if (!item) {
    return (
      <div className="relative w-full min-w-0 overflow-hidden rounded-md border">
        <div className="absolute right-2 top-2 z-10 flex text-xs tracking-wide">
          <Skeleton className="h-8 w-16 bg-destructive/10" />
        </div>
        <div className="p-3 pt-10 sm:p-4">
          <div className="flex flex-col gap-4 py-2 sm:flex-row sm:gap-5">
            <Skeleton className="mx-auto aspect-[7/3] w-full max-w-[14rem] sm:h-24" />
            <div className="text-sm tracking-wide space-y-2">
              <div>
                <Skeleton className="w-44 h-3" />
                <Skeleton className="w-32 h-2 mt-1" />
                <Skeleton className="w-24 h-2 mt-1" />
              </div>
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
          <hr />
          <div className="space-y-2">
            <div className="text-sm">
              <div className="flex items-center gap-6 p-2">
                <div className="flex items-center gap-2">
                  <PencilRuler className="size-4 text-muted-foreground/40" />
                  <Skeleton className="w-20 h-3" />
                </div>
                <div className="flex items-center gap-2">
                  <Cable className="size-4 text-muted-foreground/40" />
                  <Skeleton className="w-28 h-3" />
                </div>
              </div>
            </div>
            <div>
              <div className="overflow-hidden border rounded-md">
                <table className="min-w-full text-left text-xs font-light tracking-wide">
                  <thead className="border-b font-medium">
                    <tr>
                      <th scope="col" className="px-4 py-2">
                        #
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Spherical (SPH)
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Cylindrical (CYL)
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Axis
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Add
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="whitespace-nowrap px-4 py-2 font-medium">
                        <Skeleton className="h-3 w-12" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="whitespace-nowrap px-4 py-2 font-medium">
                        <Skeleton className="h-3 w-10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                      <td className="whitespace-nowrap px-4 py-2"><Skeleton className="h-3 w-8" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <DeleteCartItemModal />
      <div className="relative w-full min-w-0 overflow-hidden rounded-md border">
        <div className="absolute right-2 top-2 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: item.id,
                  label: item.product_color.product.model_name,
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
              src={item.product_color?.images?.[0]?.url}
              width={500}
              height={350}
              alt="Cart Item image"
              className="mx-auto aspect-[7/3] h-auto w-full max-w-[14rem] shrink-0 object-contain sm:mx-0 sm:h-24 sm:max-w-[14rem]"
            />
            <div className="min-w-0 flex-1 space-y-3 text-sm tracking-wide">
              <div className="space-y-1 pr-14 sm:pr-0">
                <p className="font-medium leading-snug">
                  {item.product_color.product.model_name}
                </p>
                {!item.frame_only && item.lens_detail && (
                  <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {item.lens_detail.hydrophobic
                        ? "Hydrophobic"
                        : "Non-Hydrophobic"}
                    </span>
                    <span>
                      {item.lens_detail.anti_reflection
                        ? "Anti-Reflection"
                        : "Non-Anti-Reflection"}
                    </span>
                    <span>
                      {item.lens_detail.blue_light_blocker
                        ? "Blue Light Blocker"
                        : "Non-Blue Light Blocker"}
                    </span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground/80">
                  Sold By Store
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">Rs {item.price}</p>
                <QuantityInput
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={4}
                />
              </div>
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
export default CartItem;
