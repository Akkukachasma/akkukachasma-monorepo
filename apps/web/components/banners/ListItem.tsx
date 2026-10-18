"use client";
import React from "react";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/store";
import { IFile, IRecordMeta } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { setData } from "@/store/banners/form.slice";
import { setItemToDelete } from "@/store/banners/data.slice";
import { Avatar, AvatarImage } from "../ui/avatar";
import { formSchema } from "@/lib/validations/admin/banners.validation";
import { z } from "zod";
import dayjs from "@/lib/dayjs";
import Link from "next/link";
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
export interface IBannerImage extends IRecordMeta {
  image?: IFile;
  url?: string;
}
export interface IBanner extends IRecordMeta, z.infer<typeof formSchema> {
  banner_images: IBannerImage[];
  categories: string[];
  shapes: string[];
}

interface ListItemProps {
  data?: IBanner;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ data }, ref) => {
    const dispatch = useAppDispatch();

    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: data?.id || "" });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    function mergeRefs(...refs: any[]) {
      return (node: HTMLElement | null) => {
        refs.forEach((ref) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref && typeof ref === "object") {
            ref.current = node;
          }
        });
      };
    }

    const handleEditClick = () => {
      dispatch(setData(data ?? null));
    };

    if (!data) {
      return <ListItemSkeleton />;
    }

    return (
      <div
        key={data.id}
        className="grid grid-cols-12 gap-2 p-2 h-14 bg-white shadow-md border rounded-lg text-sm"
        ref={mergeRefs(ref, setNodeRef)}
        style={style}
      >
        <div className="col-span-2 flex items-center gap-1">
          <DragHandleDots2Icon {...attributes} {...listeners} />
          <Link href={`/manage/banners/${data.id}`} className="!cursor-pointer">
            {data?.title || "No Title"}
          </Link>
        </div>
        <div className="col-span-2 flex items-center">
          {data?.show_on_home ? "Yes" : "No"}
        </div>
        <div className="col-span-2 flex items-center">
          {data?.is_active ? "Active" : "Inactive"}
        </div>
        <div className="col-span-2 flex items-center">
          {data.banner_images?.length}
        </div>
        <div className="col-span-2 flex items-center capitalize">
          {data.type}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-2 h-full">
          <Button
            type="button"
            onClick={() => handleEditClick()}
            variant="secondary"
            size="icon"
          >
            <EditIcon />
          </Button>
          <Button
            type="button"
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: data.id,
                  label: data.title || "No Title",
                }),
              )
            }
            variant="destructive"
            size="icon"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
    );
  },
);

const ListItemSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-2 p-2 h-14 bg-white shadow-md border rounded-lg text-sm">
      <div className="col-span-2 flex items-center gap-1">
        <DragHandleDots2Icon />
        <Skeleton className="w-32" />
      </div>
      <div className="col-span-2 flex items-center">
        <Skeleton className="w-8" />
      </div>
      <div className="col-span-2 flex items-center">
        <Skeleton className="w-14" />
      </div>
      <div className="col-span-2 flex items-center">
        <Skeleton className="w-4" />
      </div>
      <div className="col-span-2 flex items-center capitalize">
        <Skeleton className="w-10" />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2 h-full">
        <Skeleton className="size-9" />
        <Skeleton className="size-9 bg-destructive/10" />
      </div>
    </div>
  );
};

ListItem.displayName = "ListItem";

export default ListItem;
