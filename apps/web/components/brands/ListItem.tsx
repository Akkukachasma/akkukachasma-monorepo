"use client";
import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useAppDispatch } from "@/store";
import { IRecordMeta } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirstLetter } from "@/lib/utils";
import { setData } from "@/store/brands/form.slice";
import { setItemId } from "@/store/brands/form.slice";
import { setItemToDelete } from "@/store/brands/data.slice";

export interface IBrand extends IRecordMeta {
  title?: string;
  description?: string;
  slug?: string;
}

interface ListItemProps {
  data?: IBrand;
}

const ListItem: React.FC<ListItemProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  if (!data) {
    return <ListItemSkeleton />;
  }

  return (
    <Card>
      <CardContent className="pt-6 h-full flex flex-col gap-2">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {data?.title}
          </h3>
          <p className="text-sm text-gray-500">
            {capitalizeFirstLetter(data?.description)}
          </p>
        </div>
        <div className="flex items-baseline">
          <div className="flex items-end justify-end gap-2 flex-grow h-full">
            <Button
              onClick={() => {
                dispatch(setItemId(data?.id || ""));
                dispatch(
                  setData({
                    title: data?.title,
                    description: data?.description,
                    slug: data?.slug,
                  }),
                );
              }}
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
                    label: data.title || "",
                  }),
                )
              }
              className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
            >
              <DeleteIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ListItemSkeleton = () => {
  return (
    <Card>
      <CardContent className="pt-6 h-full flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="size-[100px]" />
          <div className="flex-grow flex flex-col gap-2">
            <Skeleton className="w-2/3" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2" />
              <Skeleton className="h-2 w-4/5" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        </div>
        <div className="flex items-baseline flex-grow">
          <div className="flex items-end justify-end gap-2 flex-grow h-full">
            <Skeleton className="size-[40px] bg-secondary" />
            <Skeleton className="size-[40px] bg-destructive/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ListItem;
