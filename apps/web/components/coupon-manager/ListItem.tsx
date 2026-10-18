"use client";
import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/store";
import { IRecordMeta } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirstLetter } from "@/lib/utils";
import { setData } from "@/store/coupon-manager/form.slice";
import { setItemId } from "@/store/coupon-manager/form.slice";
import { setItemToDelete } from "@/store/coupon-manager/data.slice";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/coupon-manager.validation";
import dayjs from "@/lib/dayjs";

export interface ICoupon extends IRecordMeta, z.infer<typeof formSchema> {}

interface ListItemProps {
  data?: ICoupon;
}

const ListItem: React.FC<ListItemProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  const handleEditClick = () => {
    dispatch(setItemId(data?.id || ""));
    dispatch(
      setData({
        name: data?.name,
        discount_type: data?.discount_type,
        discount_value: data?.discount_value,
        minimum_order: data?.minimum_order,
        per_user_limit: data?.per_user_limit,
        quantity: data?.quantity,
        valid_from: data?.valid_from,
        valid_till: data?.valid_till,
      }),
    );
  };

  if (!data) {
    return <ListItemSkeleton />;
  }

  return (
    <tr>
      <td className="uppercase">
        <div>{data?.name}</div>
      </td>
      <td>
        <div className="justify-center">₹{data?.minimum_order}</div>
      </td>
      <td>
        <div className="justify-center">
          {data?.discount_type === "FIXED" && "₹"}
          {data?.discount_value || 0}
          {data?.discount_type === "PERCENT" && "%"}
        </div>
      </td>
      <td>
        <div className="justify-center">{data?.quantity}</div>
      </td>
      <td>
        <div className="justify-center">{data?.per_user_limit}</div>
      </td>
      <td>
        <div>{dayjs(data?.valid_from).format("MMM DD, YYYY")}</div>
      </td>
      <td>
        <div>{dayjs(data?.valid_till).format("MMM DD, YYYY")}</div>
      </td>
      <td>
        <div className="flex items-center gap-2">
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
                  id: data?.id || "",
                  label: data.name || "",
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
};

const ListItemSkeleton = () => {
  return (
    <tr>
      <td className="uppercase">
        <div>
          <Skeleton className="w-[150px]" />
        </div>
      </td>
      <td>
        <div className="justify-center">
          <Skeleton className="w-20" />
        </div>
      </td>
      <td>
        <div className="justify-center">
          <Skeleton className="w-12" />
        </div>
      </td>
      <td>
        <div className="justify-center">
          <Skeleton className="w-12" />
        </div>
      </td>
      <td>
        <div className="justify-center">
          <Skeleton className="w-12" />
        </div>
      </td>
      <td>
        <div>
          <Skeleton className="w-[130px]" />
        </div>
      </td>
      <td>
        <div>
          <Skeleton className="w-[130px]" />
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9" />
          <Skeleton className="size-9 bg-destructive/50" />
        </div>
      </td>
    </tr>
  );
};
export default ListItem;
