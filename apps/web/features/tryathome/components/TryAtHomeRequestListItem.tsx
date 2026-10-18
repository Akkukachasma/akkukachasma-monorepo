"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalizeFirstLetter } from "@/lib/utils";
import { TryAtHomeRequest } from "../queries/useGetTryAtHomeRequests";
import useDeleteTryAtHomeRequest from "../mutations/useDeleteTryAtHomeRequest";
import { Trash2 } from "lucide-react";

interface TryAtHomeRequestListItemProps {
  data?: TryAtHomeRequest;
}

const TryAtHomeRequestListItem = React.forwardRef<
  HTMLTableRowElement,
  TryAtHomeRequestListItemProps
>(({ data }, ref) => {
  const { mutate: deleteRequest, isPending } = useDeleteTryAtHomeRequest();

  const handleDelete = () => {
    if (data) {
      deleteRequest(data.id);
    }
  };

  if (!data) {
    return <TryAtHomeRequestListItemSkeleton />;
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
        {data.purpose ? (
          <Badge variant="secondary" className="w-fit">
            {data.purpose.label}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td>
        {data.address ? (
          <div className="text-sm">
            <div>{data.address.address}</div>
            <div className="text-muted-foreground">
              {data.address.city}, {data.address.state} {data.address.zip_code}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
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

TryAtHomeRequestListItem.displayName = "TryAtHomeRequestListItem";

const TryAtHomeRequestListItemSkeleton = () => {
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
        <div className="space-y-1">
          <Skeleton className="w-[180px]" />
          <Skeleton className="w-[140px]" />
        </div>
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

export default TryAtHomeRequestListItem;
