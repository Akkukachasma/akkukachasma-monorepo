"use client";
import { Button, ProcessIndicator } from "../ui/button";
import ListItem from "./ListItem";
import useItems from "@/lib/queries/admin/coupon-manager/useItems";

const List = () => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useItems();
  if (isLoading) {
    return (
      <table
        className="ak-table"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th className="text-center min-w-[135px]">Minimum Order</th>
            <th className="text-center min-w-[100px]">Discount</th>
            <th className="text-center min-w-[135px]">Quantity</th>
            <th className="text-center min-w-[135px]">Per User Limit</th>
            <th className="min-w-[160px]">Valid From</th>
            <th className="min-w-[160px]">Valid Till</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(4)
            .fill("")
            ?.map((d) => {
              return <ListItem key={d.id} />;
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
          <th>Name</th>
          <th className="text-center min-w-[135px]">Minimum Order</th>
          <th className="text-center min-w-[100px]">Discount</th>
          <th className="text-center min-w-[135px]">Quantity</th>
          <th className="text-center min-w-[135px]">Per User Limit</th>
          <th className="min-w-[160px]">Valid From</th>
          <th className="min-w-[160px]">Valid Till</th>
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
