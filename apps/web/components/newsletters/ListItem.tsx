"use client";
import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/store";
import { IRecordMeta } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { setItemToDelete } from "@/store/newsletters/data.slice";
import dayjs from "@/lib/dayjs";

export interface INewsletterSubscriber extends IRecordMeta {
  id: string;
  number: string;
  email?: string | null;
  created_at: string;
}

function formatWhatsAppDisplay(stored: string): string {
  const digits = stored.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const rest = digits.slice(2);
    return `+91 ${rest.slice(0, 5)} ${rest.slice(5)}`;
  }
  return stored.startsWith("+") ? stored : `+${stored}`;
}

/** E.164 digits only for https://wa.me/<number> */
function whatsappDigits(stored: string): string {
  return stored.replace(/\D/g, "");
}

interface ListItemProps {
  data?: INewsletterSubscriber;
}

const ListItem: React.FC<ListItemProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  if (!data) {
    return <ListItemSkeleton />;
  }

  const waDigits = whatsappDigits(data.number);
  const waHref =
    waDigits.length >= 10 ? `https://wa.me/${waDigits}` : undefined;

  return (
    <tr>
      <td>
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium tabular-nums text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label={`Open WhatsApp chat with ${formatWhatsAppDisplay(data.number)}`}
          >
            {formatWhatsAppDisplay(data.number)}
          </a>
        ) : (
          <div className="font-medium tabular-nums">
            {formatWhatsAppDisplay(data.number)}
          </div>
        )}
      </td>
      <td>
        <div>{dayjs(data.created_at).format("MMM DD, YYYY, hh:mm A")}</div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: data.id,
                  label: formatWhatsAppDisplay(data.number),
                }),
              )
            }
            className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
            aria-label="Remove subscriber"
          >
            <DeleteIcon />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ListItemSkeleton = () => {
  return (
    <tr>
      <td>
        <Skeleton className="w-[160px] h-5" />
      </td>
      <td>
        <Skeleton className="w-[180px] h-5" />
      </td>
      <td>
        <Skeleton className="size-9" />
      </td>
    </tr>
  );
};
export default ListItem;
