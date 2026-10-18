"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FranchiseRequest } from "../queries/useGetFranchiseRequests";
import useDeleteFranchiseRequest from "../mutations/useDeleteFranchiseRequest";
import { Trash2 } from "lucide-react";

interface FranchiseRequestListItemProps {
  data?: FranchiseRequest;
}

const FranchiseRequestListItem = React.forwardRef<
  HTMLTableRowElement,
  FranchiseRequestListItemProps
>(({ data }, ref) => {
  const { mutate: deleteRequest, isPending } = useDeleteFranchiseRequest();

  const handleDelete = () => {
    if (data) {
      deleteRequest(data.id);
    }
  };

  if (!data) {
    return <FranchiseRequestListItemSkeleton />;
  }

  return (
    <tr ref={ref}>
      <td>
        <div className="font-medium">{capitalizeFirstLetter(data.name)}</div>
      </td>
      <td>
        <div>{data.email}</div>
      </td>
      <td>
        <div>{data.phone_number}</div>
      </td>
      <td>
        <div className="max-w-[200px]">
          <div className="capitalize">{data.owner}</div>
          {data.owner === "other" && data.other_owner ? (
            <div
              className="text-xs text-muted-foreground mt-0.5 truncate"
              title={data.other_owner}
            >
              {data.other_owner}
            </div>
          ) : null}
        </div>
      </td>
      <td>
        <div className="max-w-[200px]">
          <div className="capitalize">{data.nearby}</div>
          {data.nearby === "other" && data.other_near_by ? (
            <div
              className="text-xs text-muted-foreground mt-0.5 truncate"
              title={data.other_near_by}
            >
              {data.other_near_by}
            </div>
          ) : null}
        </div>
      </td>
      <td>
        <div>{data.address?.city || "-"}</div>
      </td>
      <td>
        <div>{data.address?.state || "-"}</div>
      </td>
      <td>
        <div>{data.address?.zip_code || "-"}</div>
      </td>
      <td>
        {data.message ? (
          <div className="max-w-xs truncate" title={data.message}>
            {data.message}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td>
        <div>{new Date(data.created_at).toLocaleDateString()}</div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

FranchiseRequestListItem.displayName = "FranchiseRequestListItem";

const FranchiseRequestListItemSkeleton = () => {
  return (
    <tr>
      <td>
        <Skeleton className="w-[150px]" />
      </td>
      <td>
        <Skeleton className="w-[200px]" />
      </td>
      <td>
        <Skeleton className="w-[120px]" />
      </td>
      <td>
        <Skeleton className="w-[100px]" />
      </td>
      <td>
        <Skeleton className="w-[100px]" />
      </td>
      <td>
        <Skeleton className="w-[100px]" />
      </td>
      <td>
        <Skeleton className="w-[100px]" />
      </td>
      <td>
        <Skeleton className="w-[80px]" />
      </td>
      <td>
        <Skeleton className="w-[120px]" />
      </td>
      <td>
        <Skeleton className="w-[100px]" />
      </td>
      <td>
        <Skeleton className="size-9" />
      </td>
    </tr>
  );
};

export default FranchiseRequestListItem;
