"use client";
import React from "react";
import { Button, ProcessIndicator } from "../ui/button";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/categories/useItems";
import useReorderCategories from "@/lib/mutations/admin/categories/useReorder";
import { useAppSelector } from "@/store";

const List = () => {
  const searchTerm = useAppSelector(
    (store) => store.categoryStore.dataStore.search_term,
  );
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useItems({ completeFetch: true });
  const { mutate: reorderCategories, isPending: isReordering } =
    useReorderCategories();

  const [orderedData, setOrderedData] = React.useState(data ?? []);

  React.useEffect(() => {
    setOrderedData(data ?? []);
  }, [data]);

  const move = (from: number, to: number) => {
    if (!orderedData?.length) return;
    if (from < 0 || to < 0 || from >= orderedData.length || to >= orderedData.length)
      return;
    const next = [...orderedData];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrderedData(next);
    reorderCategories(
      next.map((c, idx) => ({
        id: c.id,
        order: idx + 1,
      })),
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {orderedData?.map((d, idx) => {
        return (
          <ListItem
            key={d.id}
            data={d}
            index={idx}
            total={orderedData.length}
            disableReorder={Boolean(searchTerm) || isReordering}
            onMoveUp={() => move(idx, idx - 1)}
            onMoveDown={() => move(idx, idx + 1)}
          />
        );
      })}

      {hasNextPage && (
        <div className="min-h-24 grid place-content-center">
          <Button
            type="button"
            disabled={isFetching}
            variant="ghost"
            onClick={() => (isFetching ? null : fetchNextPage())}
          >
            <ProcessIndicator isProcessing={isFetching} btnText="Load more" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default List;
