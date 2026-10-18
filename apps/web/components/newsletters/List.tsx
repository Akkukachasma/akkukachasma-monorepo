"use client";
import { Button, ProcessIndicator } from "../ui/button";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/newsletters/useItems";

const List = () => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useItems();
  if (isLoading) {
    return (
      <table
        className="ak-table w-full"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        <thead>
          <tr>
            <th>WhatsApp number</th>
            <th className="min-w-[180px]">Subscribed on</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(4)
            .fill("")
            ?.map((_, i) => {
              return <ListItem key={i} />;
            })}
        </tbody>
      </table>
    );
  }

  return (
    <table
      className="ak-table"
      style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
    >
      <thead>
        <tr>
          <th>WhatsApp number</th>
          <th className="min-w-[180px]">Subscribed on</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((d) => {
          return <ListItem key={d.id} data={d} />;
        })}
      </tbody>

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
    </table>
  );
};

export default List;
