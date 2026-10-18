import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useAppDispatch } from "@/store";
import { FileType, IRecordMeta } from "@/lib/types";
import { setLensDetailToDelete } from "@/store/lens-details/data.slice";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { setData, setLensDetailId } from "@/store/lens-details/form.slice";
import { Badge } from "../ui/badge";
import LensDetailsIcon from "../icons/LensDetailsIcon";
import dayjs from "dayjs";
import HydroPhobicIcon from "../icons/HydrophobicIcon";
import AntiRefelctionIcon from "../icons/AntiReflectionIcon";
import UVProtectionIcon from "../icons/UVProtectionIcon";
import BlueLightBlockerIcon from "../icons/BlueLightBlockerIcon";
import BreakageIcon from "../icons/BreakageIcon";

export interface ILensDetail extends IRecordMeta {
  lens_id?: string;
  title?: string;
  price?: number;
  thickness?: number;
  power_range?: string;
  warranty_period?: number;
  blue_light_blocker?: boolean;
  crack_resistant?: number;
  hydrophobic?: number;
  anti_reflection?: boolean;
  uv_protection?: boolean;
  lens_feature?: { title: string };
  lens_feature_id?: string;
  user_id?: string;
  image?: FileType;
}

interface LensDetailProps {
  data?: ILensDetail;
}

const LensDeatail: React.FC<LensDetailProps> = ({ data }) => {
  const dispatch = useAppDispatch();

  const handleEdit = () => {
    if (data) {
      dispatch(setLensDetailId(data?.id || ""));
      dispatch(
        setData({
          title: data?.title,
          default_url: data?.image?.url,
          lens_feature_id: data?.lens_feature_id,
          anti_reflection: data?.anti_reflection,
          blue_light_blocker: data?.blue_light_blocker,
          crack_resistant: data?.crack_resistant,
          hydrophobic: data?.hydrophobic,
          lens_id: data?.lens_id,
          power_range: data?.power_range,
          price: data?.price,
          thickness: data?.thickness,
          uv_protection: data?.uv_protection,
          warranty_period: data?.warranty_period,
          ...(data?.image && { image: data?.image }),
        }),
      );
    }
  };

  const handleDelete = () => {
    if (data) {
      dispatch(
        setLensDetailToDelete({
          id: data?.id || "",
          label: data?.title || "",
        }),
      );
    }
  };

  if (!data) {
    return <LensFeatureSkeleton />;
  }

  return (
    <Card>
      <CardContent className="pt-6 h-full flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <Avatar className="size-[100px] rounded-lg">
              <AvatarImage src={data?.image?.url} alt={data?.title} />
              <AvatarFallback className="rounded-lg">
                {data?.title?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="">
              <span className="text-2xl font-bold text-success">
                ₹ {data?.price}
              </span>
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-2 w-full">
            <div>
              <Badge
                variant="secondary"
                className="gap-2 text-xs cursor-pointer"
                title="Lens Feature"
              >
                <LensDetailsIcon />
                <span className="text-gray-400">
                  {data?.lens_feature?.title}
                </span>
              </Badge>
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {data?.title}
              </h3>
            </div>
            <div className="flex items-center flex-wrap gap-4 text-gray-400">
              {data?.crack_resistant !== 0 && (
                <span
                  title={`${data?.crack_resistant}% Breakage And Crack Resistance`}
                  className="flex items-center"
                >
                  <BreakageIcon className="animate-smooth cursor-pointer hover:text-destructive hover:scale-110 size-[23px]" />
                  &nbsp;{data?.crack_resistant}%
                </span>
              )}

              {data?.hydrophobic !== 0 && (
                <span
                  title={`${data?.hydrophobic}% Hydrophobic`}
                  className="flex items-center"
                >
                  <HydroPhobicIcon className="animate-smooth cursor-pointer hover:text-blue-300 hover:scale-110 size-[25px]" />
                  &nbsp;{data?.hydrophobic}%
                </span>
              )}

              {data?.blue_light_blocker && (
                <span title="Blue light blocker">
                  <BlueLightBlockerIcon className="animate-smooth cursor-pointer hover:text-blue-700 hover:scale-110 size-[25px]" />
                </span>
              )}

              {data?.anti_reflection && (
                <span title="Anti-Reflection">
                  <AntiRefelctionIcon className="animate-smooth cursor-pointer hover:text-gray-900 hover:scale-110 size-[25px]" />
                </span>
              )}

              {data?.uv_protection && (
                <span title="UV Protection">
                  <UVProtectionIcon className="animate-smooth cursor-pointer hover:text-violet-600 hover:scale-110 size-[25px]" />
                </span>
              )}
            </div>
            <div className="text-gray-500">
              {data?.thickness !== 0 && (
                <span className="flex items-center gap-1">
                  {data?.thickness} index thickness
                </span>
              )}
              {data?.warranty_period !== 0 && (
                <span className="flex items-center gap-1">
                  {data?.warranty_period} month
                  {data?.warranty_period === 1 ? "" : "s"} warranty
                </span>
              )}
              <span className="flex items-center gap-1">
                Lens ID - {data?.lens_id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-baseline flex-grow">
          <span
            title="Last updated on"
            className="text-xs text-gray-400 cursor-pointer"
          >
            {data?.updated_at
              ? dayjs(data?.updated_at).format("MMM DD, YYYY")
              : ""}
          </span>
          <div className="flex items-end justify-end gap-2 flex-grow h-full">
            <Button
              onClick={() => handleEdit()}
              variant="secondary"
              size="icon"
            >
              <EditIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete()}
              className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
            >
              <DeleteIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
export default LensDeatail;
