import EditIcon from "@/components/icons/EditIcon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IRecordMeta } from "@/lib/types";
import { useAppDispatch } from "@/store";
import { Tag, Trash } from "lucide-react";
import { setData, setDialog, setItemToDelete } from "../store/ui.slice";
import { z } from "zod";
import { formSchema } from "../tax.schema";
import { Badge } from "@/components/ui/badge";

export interface ITax extends IRecordMeta, z.infer<typeof formSchema> {
  setting_id: string;
}

interface TaxCardProps {
  data?: ITax;
}

const TaxCard: React.FC<TaxCardProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  if (!data) {
    return <TaxCardSkeleton />;
  }

  const handleEdit = () => {
    dispatch(setDialog(true));
    dispatch(setData(data));
  };

  return (
    <Card className="w-full min-h-44 shadow-none">
      <CardHeader className="">
        <CardTitle className="flex items-center justify-between">
          <span>{data.label}</span>
          {data.type === "GST" && <Badge>gst</Badge>}
          {data.type === "VAT" && <Badge variant="secondary">vat</Badge>}
          {data.type === "OTHER" && <Badge variant="outline">other</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>{data.description}</div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        <div className="flex items-center gap-1 text-xs">
          <Tag className="rotate-90 size-4" />
          <span>
            {data.category_ids?.length
              ? `${data.category_ids.length === 1 ? "1 Category" : `${data.category_ids.length} Categories`}`
              : "All"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleEdit()} variant="ghost" size="icon">
            <EditIcon />
          </Button>
          <Button
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: data.id,
                  label: data.label,
                }),
              )
            }
            variant="destructive"
            size="icon"
          >
            <Trash />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const TaxCardSkeleton = () => {
  return (
    <Card className="w-full h-44 shadow-none">
      <CardHeader>
        <CardTitle>
          <Skeleton className="w-full h-3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-[80%] h-3 mt-1" />
        <Skeleton className="w-[50%] h-3 mt-1" />
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Skeleton className="size-9 bg-secondary" />
        <Skeleton className="size-9 bg-destructive/20" />
      </CardFooter>
    </Card>
  );
};

export default TaxCard;
