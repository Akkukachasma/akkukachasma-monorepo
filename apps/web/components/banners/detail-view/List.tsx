"use client";
import React from "react";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import ListItem from "./ListItem";
import Link from "next/link";

import {
  DragHandleDots1Icon,
  DragHandleDots2Icon,
  DragHandleVerticalIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import dayjs from "dayjs";
import { Button } from "../../ui/button";
import EditIcon from "../../icons/EditIcon";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import useUpdateOrder from "@/lib/mutations/admin/banners/useUpdateOrder";
import { useParams } from "next/navigation";
import useFetch from "@/lib/hooks/use-fetch";
import { IBannerImage } from "../ListItem";
import ENDPOINTS from "@/lib/endpoints";

const List = () => {
  const sensors = useSensors(useSensor(PointerSensor));
  const params = useParams<{ id: string }>();
  const bannerId = params.id || "";
  const { data: items = [], isLoading } = useFetch<IBannerImage[]>({
    endpoint: ENDPOINTS.admin.banners.banner_images.fetch_all(bannerId),
    validate: true,
    enabledKey: bannerId,
  });
  const { mutate } = useUpdateOrder(true, () => {
    console.log("everything was good.");
  }, bannerId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && Array.isArray(items)) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Prepare payload
      const updatePayload = newItems.map((item, idx) => ({
        id: item.id,
        order: idx + 1,
      }));

      // Call backend API to persist order
      mutate({ new_orders: updatePayload });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 overflow-auto h-full">
        <div className="grid grid-cols-12 gap-2 p-2 font-bold flex-shrink-0">
          <div className="col-span-2">Title</div>
          <div className="col-span-2">Visible on home page</div>
          <div className="col-span-2">Active</div>
          <div className="col-span-2">Total Images</div>
          <div className="col-span-2">Banner Type</div>
          <div className="col-span-2 flex items-center justify-end pr-6">
            Updated At
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-grow p-2 oveflow-auto">
          {Array(9)
            .fill("")
            .map((_, i) => {
              return <ListItem key={i} />;
            })}
        </div>
      </div>
    );
  }

  if (!items?.length) return <div>Nothing here</div>;

  return (
    <div className="flex flex-col gap-2 overflow-auto h-full">
      <div className="grid grid-cols-12 gap-2 p-2 font-bold flex-shrink-0">
        <div className="col-span-2">Image</div>
        <div className="col-span-4">Url</div>
        <div className="col-span-4">Updated At</div>
        <div className="col-span-2 flex items-center justify-end pr-6">
          Actions
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 flex-grow p-2 oveflow-auto">
            {items.map((d) => {
              return <ListItem data={d} key={d.id} />;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default List;
