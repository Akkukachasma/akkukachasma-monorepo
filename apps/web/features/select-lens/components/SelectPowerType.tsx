"use client";
import { IPowerType } from "@/components/power-types/PowerType";
import { DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import TemplateRadioGroup, {
  TemplateProps,
  TemplateRadioOption,
} from "@/components/ui/TemplateRadioGroup";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import useSessionStorage from "@/hooks/use-session-storage";
import usePowerTypes from "@/lib/queries/admin/power-types/usePowerTypes";
import { cn } from "@/lib/utils";
import { purchaseSchema } from "@/features/select-lens/purchase.schema";
import Image from "next/image";
import React from "react";
import { Control } from "react-hook-form";
import * as z from "zod";
import { PurchaseStore } from "../types";

export interface PurchaseStepProps {
  onBack?: () => void;
  onNext?: () => void;
  control?: Control<z.infer<typeof purchaseSchema>>;
  productPowerTypes?: IPowerType[];
}

const SelectPowerType: React.FC<PurchaseStepProps> = ({
  control,
  productPowerTypes,
}) => {
  const { value: purchaseStore, setValue: setPurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  const usePowerTypesResult = usePowerTypes();
  const { data: fetchedPowerTypes, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePowerTypesResult;

  const useProductPowerTypes =
    Array.isArray(productPowerTypes) && productPowerTypes.length > 0;
  const powerTypes = useProductPowerTypes ? productPowerTypes : fetchedPowerTypes;

  const elementRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: useProductPowerTypes ? false : hasNextPage,
    isFetchingNextPage,
    isLoading: useProductPowerTypes ? false : isLoading,
  });

  const powerTypeOptions: TemplateRadioOption[] =
    powerTypes?.map((d) => ({
      value: d.id,
      label: d.title || "",
      icon: d.image?.url,
      data: d,
    })) || [];

  return (
    <div className="flex flex-col gap-4 sm:gap-10">
      <DialogTitle>Select Power Type</DialogTitle>
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
              template={PowerTypeInput as any}
              options={powerTypeOptions}
              className="grid grid-cols-12 gap-2 sm:gap-4"
              templateRef={elementRef}
            />
          )}
        />
      </div>
    </div>
  );
};

const PowerTypeInput = React.forwardRef<
  HTMLDivElement,
  TemplateProps<IPowerType>
>(({ data, isChecked, isLast, onClick }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "cursor-pointer col-span-6 sm:col-span-6 md:col-span-4 lg:col-span-3 flex-shrink-0 border p-4 rounded-xl flex flex-col items-center",
        isChecked && "border-primary border-2 bg-primary/10",
      )}
      onClick={(e) => onClick(e)}
    >
      <div className="relative size-[100px] overflow-hidden rounded-md bg-muted">
        {data?.data?.image?.url ? (
          <Image
            src={data.data.image.url}
            alt={data?.data?.title ?? "Power type"}
            fill
            className="object-contain"
            sizes="100px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium">{data?.data?.title || ""}</p>
        <p className="text-xs text-gray-500 text-center">
          {data?.data?.description || ""}
        </p>
      </div>
    </div>
  );
});

PowerTypeInput.displayName = "PowerTypeInput";

export default SelectPowerType;
