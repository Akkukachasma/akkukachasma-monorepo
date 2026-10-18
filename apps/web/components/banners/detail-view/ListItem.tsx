"use client";
import React from "react";
import EditIcon from "../../icons/EditIcon";
import { Button } from "../../ui/button";
import { useAppDispatch } from "@/store";
import { IFile, IRecordMeta } from "@/lib/types";
import { Skeleton } from "../../ui/skeleton";
import { setData } from "@/store/banners/banner-image.slice";
import { setItemToDelete } from "@/store/banners/banner-image.slice";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import dayjs from "@/lib/dayjs";
import Link from "next/link";
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { IBannerImage } from "../ListItem";

interface ListItemProps {
  data?: IBannerImage;
}

const ListItem: React.FC<ListItemProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data?.id || "" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      ref={setNodeRef}
      style={style}
    >
      <div className="col-span-2 flex items-center gap-1">
        <DragHandleDots2Icon {...attributes} {...listeners} />
        <Avatar className="rounded-md h-full flex-shrink-0">
          <AvatarImage src={data?.image?.url} alt={"Image for power type"} />
          <AvatarFallback>{data.url?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="col-span-4">{data.url}</div>
      <div className="col-span-4">
        {dayjs(data.updated_at).format("DD MMM, YYYY | hh:mm a")}
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
                label: "No Title",
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
};

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
      <div className="col-span-4 flex items-center">
        <Skeleton className="w-24" />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2 h-full">
        <Skeleton className="size-9" />
        <Skeleton className="size-9 bg-destructive/10" />
      </div>
    </div>
  );
};

export default ListItem;
