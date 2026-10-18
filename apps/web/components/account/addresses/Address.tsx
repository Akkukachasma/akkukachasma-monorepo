"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IRecordMeta } from "@/lib/types";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/store";
import { openEditAddressModal } from "@/store/account.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";

export interface IAddress extends IRecordMeta {
  label: "home" | "work" | "other";
  notes: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  user_id: string;
}

interface AddressProps {
  data?: IAddress;
  index: number;
}
const labelColors: Record<IAddress["label"], string> = {
  home: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  work: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  other: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
};

const Address: React.FC<AddressProps> = ({ data }) => {
  const dispatch = useAppDispatch();
  const api = getApiClient();
  const queryClient = useQueryClient();

  const { mutate: removeAddress, isPending: removing } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(ENDPOINTS.account.remove_address(id));
      return res.data;
    },
    onSuccess: (res) => {
      toast({ description: res.message, variant: "default" });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.account.fetch_addresses],
      });
    },
    onError: (err: RequestError) => {
      toast({
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });

  if (!data) {
    return <div>loading...</div>;
  }

  return (
    <Card className="w-full overflow-hidden rounded-xl border-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <MapPin className="size-4" />
          </span>
          <CardTitle className="truncate text-base font-semibold sm:text-lg">
            Address
          </CardTitle>
        </div>
        <Badge className={labelColors[data.label]}>{data.label}</Badge>
      </CardHeader>

      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p className="break-words text-foreground/80">{data.address}</p>
        <p>
          {data.city}, {data.state} {data.zip_code}
        </p>
        {data.country && <p>{data.country}</p>}
        {data.notes && (
          <p className="text-xs italic text-muted-foreground">
            &ldquo;{data.notes}&rdquo;
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="min-h-9 touch-manipulation"
          onClick={() => dispatch(openEditAddressModal(data))}
        >
          <Pencil className="mr-1 size-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="min-h-9 touch-manipulation"
          disabled={removing}
          onClick={() => {
            if (window.confirm("Remove this address?")) {
              removeAddress(data.id);
            }
          }}
        >
          <Trash2 className="mr-1 size-4" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};
export default Address;
