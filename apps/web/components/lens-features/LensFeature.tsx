import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useAppDispatch } from "@/store";
import { FileType, IRecordMeta } from "@/lib/types";
import { setLensFeatureToDelete } from "@/store/lens-features/data.slice";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { capitalizeFirstLetter } from "@/lib/utils";
import { setData, setLensFeatureId } from "@/store/lens-features/form.slice";
export interface ILensFeature extends IRecordMeta {
  image?: FileType;
  title?: string;
  description?: string;
  power_type_id?: string;
}

interface LensFeatureProps {
  data?: ILensFeature;
}

const LensFeature = React.forwardRef<HTMLDivElement, LensFeatureProps>(
  ({ data }, ref) => {
    const dispatch = useAppDispatch();

    if (!data) {
      return <LensFeatureSkeleton />;
    }
    return (
      <Card ref={ref}>
        <CardContent className="pt-6 h-full flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarImage src={data?.image?.url} alt={data?.title} />
              <AvatarFallback>
                {data?.title?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-800 capitalize">
                {data?.title}
              </h3>
              <p className="text-sm text-gray-500">
                {capitalizeFirstLetter(data?.description)}
              </p>
            </div>
          </div>
          <div className="flex items-baseline flex-grow">
            <div className="flex items-end justify-end gap-2 flex-grow h-full">
              <Button
                onClick={() => {
                  dispatch(setLensFeatureId(data?.id || ""));
                  dispatch(
                    setData({
                      title: data?.title,
                      description: data?.description,
                      default_url: data?.image?.url,
                      power_type_id: data?.power_type_id,
                      image: data.image,
                    }),
                  );
                }}
                variant="secondary"
                size="icon"
              >
                <EditIcon />
              </Button>
              <Button
                // disabled={isDeleting}
                variant="ghost"
                size="icon"
                onClick={() =>
                  dispatch(
                    setLensFeatureToDelete({
                      id: data?.id || "",
                      label: data.title || "",
                    }),
                  )
                }
                className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
              >
                <DeleteIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

LensFeature.displayName = "LensFeature";

const LensFeatureSkeleton = () => {
  return (
    <Card>
      <CardContent className="pt-6 h-full flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="size-[100px]" />
          <div className="flex-grow flex flex-col gap-2">
            <Skeleton className="w-2/3" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2" />
              <Skeleton className="h-2 w-4/5" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        </div>
        <div className="flex items-baseline flex-grow">
          <div className="flex items-end justify-end gap-2 flex-grow h-full">
            <Skeleton className="size-[40px] bg-secondary" />
            <Skeleton className="size-[40px] bg-destructive/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default LensFeature;
