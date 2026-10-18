import { DialogTitle } from "@/components/ui/dialog";
import { PurchaseStepProps } from "./SelectPowerType";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PurchaseStore } from "../types";
import useSessionStorage from "@/hooks/use-session-storage";
import LensDetailTemplate from "./LensDetailTemplate";
import useLensDetails from "@/lib/queries/admin/lens-details/useLensDetails";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

import React from "react";
import { FormField } from "@/components/ui/form";
import TemplateRadioGroup from "@/components/ui/TemplateRadioGroup";

const SelectLensDetail: React.FC<PurchaseStepProps> = ({
  onNext,
  onBack,
  control,
}) => {
  const { value: purchaseStore, setValue: setPurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLensDetails({
      lens_feature_id: purchaseStore?.data?.lens_feature_id,
    });
  const elementRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });


  return (
    <div className="flex flex-col gap-4 sm:gap-10 overflow-auto">
      <DialogTitle className="items-center flex gap-2">
        <Button
          title="Back to power type selection"
          size="icon"
          variant="ghost"
          onClick={() =>
            setPurchaseStore((prev) => {
              return {
                ...prev,
                step: prev.step - 1,
              } as PurchaseStore;
            })
          }
        >
          <ChevronLeft />
        </Button>
        <span> Select Lens Detail</span>
      </DialogTitle>
      <div className="flex-grow overflow-auto">
        <FormField
          control={control}
          name="power_type_id"
          render={({ field }) => (
            <TemplateRadioGroup
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setPurchaseStore(
                  (prev) =>
                    ({
                      ...prev,
                      step: 2,
                      data: {
                        ...prev.data,
                        power_type_id: val,
                      },
                    }) as PurchaseStore,
                );
              }}
              name="power_type_id"
              template={LensDetailTemplate as any}
              options={data as any}
              className="flex gap-2"
              templateRef={elementRef}
            />
          )}
        />
      </div>
    </div>
  )
};
export default SelectLensDetail;
