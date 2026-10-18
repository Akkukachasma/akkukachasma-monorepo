import { ILensDetail } from "@/components/lens-details/LensDetail";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SliderTemplateProps } from "@/components/ui/swiper/MultiCardSlider";
import useSessionStorage from "@/hooks/use-session-storage";
import React from "react";
import { PurchaseStore } from "../types";
import { cn } from "@/lib/utils";
import { useSwiper } from "swiper/react";
import { LaptopMinimalCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BreakageIcon from "@/components/icons/BreakageIcon";
import HydroPhobicIcon from "@/components/icons/HydrophobicIcon";
import AntiRefelctionIcon from "@/components/icons/AntiReflectionIcon";
import UVProtectionIcon from "@/components/icons/UVProtectionIcon";

const LensDetailTemplate: React.FC<SliderTemplateProps<ILensDetail>> = ({
  index,
  data,
}) => {
  const swiper = useSwiper();
  const [expand, setExpand] = React.useState(false);
  const { value: purchaseStore, setValue: setPurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  const isChecked = purchaseStore?.data?.lens_detail_id === data?.id;
  const selectedIndex = isChecked ? index : null;
  const handleLensDetailSelection = (lens_detail_id: string) => {
    if (purchaseStore?.data) {
      setPurchaseStore({
        ...(purchaseStore && purchaseStore),
        step: 4,
        data: {
          ...(purchaseStore?.data && purchaseStore.data),
          lens_detail_id,
        },
      });
    }
  };

  React.useEffect(() => {
    if (typeof selectedIndex === "number" && swiper) {
      swiper.slideTo(selectedIndex);
    }
  }, [selectedIndex, swiper]);

  return (
    <Card
      className={cn("w-[270px] flex-shrink-0 overflow-hidden", isChecked && "border-primary border-2 bg-primary/10")}
      onClick={(e) => handleLensDetailSelection(data?.id)}
    >
      <CardContent className="p-0 h-full flex flex-col gap-2">
        <Avatar className="w-full h-40 bg-white relative rounded-none">
          <AvatarImage
            src={data?.image?.url ?? undefined}
            alt={data?.title}
          />
          <AvatarFallback>
            {data?.title?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 capitalize">
              {data?.title}
            </h3>
            <span className="text-2xl font-bold text-success">
              ₹ {data?.price}
            </span>
          </div>

          <div className="flex-grow flex flex-col gap-2 w-full">
            <div className="flex items-center flex-wrap gap-2 text-gray-400">
              {data?.crack_resistant !== 0 && (
                <span
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <BreakageIcon className="animate-smooth cursor-pointer hover:text-destructive hover:scale-110 size-[23px]" />
                    {data?.crack_resistant}%
                  </span>

                  <span>Crack Resistance</span>
                </span>
              )}

              {data?.hydrophobic !== 0 && (
                <span
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <HydroPhobicIcon className="animate-smooth cursor-pointer hover:text-blue-300 hover:scale-110 size-[25px]" />
                    {data?.hydrophobic}%
                  </span>

                  <span>Hydrophobic</span>
                </span>
              )}

              {data?.blue_light_blocker && (
                <span
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <LaptopMinimalCheck className="animate-smooth cursor-pointer hover:text-blue-300 hover:scale-110 size-[25px]" />
                  </span>

                  <span>Blue light blocker</span>
                </span>
              )}

              {data?.anti_reflection && (
                <span
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <AntiRefelctionIcon className="animate-smooth cursor-pointer hover:text-gray-900 hover:scale-110 size-[25px]" />
                  </span>

                  <span>Anti Reflection Coating</span>
                </span>
              )}

              {data?.uv_protection && (
                <span
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-1">
                    <UVProtectionIcon className="animate-smooth cursor-pointer hover:text-violet-600 hover:scale-110 size-[25px]" />
                  </span>

                  <span>UV Protection</span>
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
                  {data?.warranty_period === 1 ? "" : "s"} warranty on coating peel off
                </span>
              )}
              <span className="flex items-center gap-1">
                Lens ID - {data?.lens_id}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
};
export default LensDetailTemplate;
