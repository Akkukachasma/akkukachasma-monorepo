"use client";
import { Button, ProcessIndicator } from "../ui/button";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/brands/useItems";

const List = () => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useItems();
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
      {data?.map((d) => {
        return <ListItem key={d.id} data={d} />;
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
