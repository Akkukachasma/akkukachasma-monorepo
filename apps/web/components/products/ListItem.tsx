"use client";
import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/store";
import { IFile, IProductColor, IRecordMeta } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { z } from "zod";
import {
  formSchema,
  frameSizes,
} from "@/lib/validations/admin/product.validation";
import { setData } from "@/store/products/form.slice";
import { setItemToDelete } from "@/store/products/data.slice";
import Link from "next/link";
import { ICategory } from "../categories/ListItem";
import { IShape } from "../shapes/ListItem";
import { IFrameMaterial } from "../frame-materials/FrameMaterial";
import { IPowerType } from "../power-types/PowerType";
import { IColor } from "../colors/ListItem";

export interface IProduct extends IRecordMeta, z.infer<typeof formSchema> {
  product_colors: IProductColor[];
  discount_percent: number;
  slug: string;
  category: ICategory;
  shape: IShape;
  frame_material: IFrameMaterial;
  power_types: IPowerType[];
  /** Present on product details when the user is signed in. */
  is_wishlisted?: boolean;
}

/** Admin list row: ProductColor with nested product (GET /products admin). */
export interface IAdminProductListRow extends IRecordMeta {
  id: string;
  model_number: string | null;
  stock_quantity: number | null;
  colors: IColor[];
  images: IFile[];
  product: IProduct;
}

/** Match ak-table `td > *` flex row; w-full so justify-* aligns to column edges. */
const cellStartLead =
  "flex h-12 w-full min-w-0 items-center justify-start pl-4 pr-3 text-sm";
const cellStart =
  "flex h-12 w-full min-w-0 items-center justify-start px-3 text-sm";
const cellEnd =
  "flex h-12 w-full items-center justify-end px-3 text-sm tabular-nums";

function formatFrameSizeLabels(
  sizes: IProduct["frame_size"] | undefined,
): string {
  if (!sizes?.length) return "—";
  return sizes
    .map(
      (v) =>
        frameSizes.find((o) => o.value === v)?.label ??
        String(v).replace(/_/g, " ").toLowerCase(),
    )
    .join(", ");
}

interface ListItemProps {
  data?: IAdminProductListRow;
}

function ListItem({ data }: ListItemProps) {
  const dispatch = useAppDispatch();

  const handleEditClick = () => {
    dispatch(setData(data?.product ?? null));
  };

  if (!data) {
    return <ListItemSkeleton />;
  }

  const p = data.product;

  return (
    <tr>
      <td className="align-middle">
        <Link
          className={cn(
            cellStartLead,
            "animate-smooth font-medium tabular-nums hover:text-success hover:underline",
          )}
          href={`/manage/products/${p?.id}`}
        >
          {data.model_number ?? "—"}
        </Link>
      </td>
      <td className="align-middle">
        <div className={cellStart}>
          {capitalizeFirstLetter(p?.shape?.title) || "—"}
        </div>
      </td>
      <td className="align-middle">
        <div className={cellStart}>{formatFrameSizeLabels(p?.frame_size)}</div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>
          {data.stock_quantity != null ? data.stock_quantity : "—"}
        </div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>₹{p?.listing_price || 0}</div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>₹{p?.price || 0}</div>
      </td>
      <td className="align-middle">
        <div className={cellStart}>{p?.category?.title ?? "—"}</div>
      </td>
      <td className="align-middle">
        <div className="flex h-12 w-full items-center justify-end gap-2 pr-4">
          <Button
            onClick={() => handleEditClick()}
            variant="secondary"
            size="icon"
          >
            <EditIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: p?.id || "",
                  label:
                    [data.model_number, p.model_name]
                      .filter(Boolean)
                      .join(" · ") || p.model_name || "",
                }),
              )
            }
            className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
          >
            <DeleteIcon />
          </Button>
        </div>
      </td>
    </tr>
  );
}

const ListItemSkeleton = () => {
  return (
    <tr>
      <td className="align-middle">
        <div className={cellStartLead}>
          <Skeleton className="h-5 w-[7rem]" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellStart}>
          <Skeleton className="h-5 w-20" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellStart}>
          <Skeleton className="h-5 w-24" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>
          <Skeleton className="h-5 w-8" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>
          <Skeleton className="h-5 w-14" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellEnd}>
          <Skeleton className="h-5 w-14" />
        </div>
      </td>
      <td className="align-middle">
        <div className={cellStart}>
          <Skeleton className="h-5 w-24" />
        </div>
      </td>
      <td className="align-middle">
        <div className="flex h-12 w-full items-center justify-end gap-2 pr-4">
          <Skeleton className="size-9" />
          <Skeleton className="size-9 bg-destructive/50" />
        </div>
      </td>
    </tr>
  );
};
export default ListItem;
