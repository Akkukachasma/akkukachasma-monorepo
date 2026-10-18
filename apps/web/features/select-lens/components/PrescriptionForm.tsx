import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Modal, { ModalProps } from "@/components/ui/modal";
import { PurchaseStepProps } from "./SelectPowerType";
import SelectBox from "@/components/ui/select-box";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useSessionStorage from "@/hooks/use-session-storage";
import { PurchaseStore } from "../types";
import { InputOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/hooks/use-toast";

interface PrescriptionFormProps extends Omit<ModalProps, "children"> {
  control: PurchaseStepProps["control"];
}

type PrescriptionFieldName =
  | "prescription.right_sph"
  | "prescription.right_cyl"
  | "prescription.right_axis"
  | "prescription.right_add"
  | "prescription.left_sph"
  | "prescription.left_cyl"
  | "prescription.left_axis"
  | "prescription.left_add";

const sph_options: InputOption[] = Array.from({ length: 81 }, (_, i) => {
  const value = (-14 + i * 0.25).toFixed(2);
  const formatted = value.startsWith("-")
    ? value
    : value === "0.00"
      ? `${value}`
      : `+${value}`;
  return {
    value: formatted,
    label: value === "0.00" ? `${formatted} (Plain)` : formatted,
  };
});

const cyl_options: InputOption[] = Array.from({ length: 41 }, (_, i) => {
  const value = (-6 + i * 0.25).toFixed(2);
  const formatted = value.startsWith("-")
    ? value
    : value === "0.00"
      ? `${value}`
      : `+${value}`;
  return {
    value: formatted,
    label: value === "0.00" ? `${formatted} (Plain)` : formatted,
  };
});

const axis_options: InputOption[] = Array.from({ length: 181 }, (_, i) => {
  const value = i.toString();
  return { value, label: `${value}°` };
});

const add_options: InputOption[] = [
  { value: "none", label: "None" },
  ...Array.from({ length: 9 }, (_, i) => {
    const value = (1 + i * 0.25).toFixed(2);
    const formatted = value.startsWith("-") ? value : `+${value}`;
    return { value: formatted, label: formatted };
  }),
];

type EyeSide = "right" | "left";

const EYE_LABELS: Record<EyeSide, string> = {
  right: "Right OD",
  left: "Left OS",
};

const EYE_FIELDS: {
  suffix: string;
  label: string;
  options: InputOption[];
  sessionKey: string;
}[] = [
  { suffix: "sph", label: "Sphere (SPH)", options: sph_options, sessionKey: "sph" },
  { suffix: "cyl", label: "Cylinder (CYL)", options: cyl_options, sessionKey: "cyl" },
  { suffix: "axis", label: "Axis (AXI)", options: axis_options, sessionKey: "axis" },
  { suffix: "add", label: "Add", options: add_options, sessionKey: "add" },
];

function PrescriptionSelectField({
  control,
  name,
  label,
  options,
  sessionKey,
  onFieldChange,
}: {
  control: PrescriptionFormProps["control"];
  name: PrescriptionFieldName;
  label: string;
  options: InputOption[];
  onFieldChange: (sessionKey: string, val: string) => void;
  sessionKey: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </span>
          <FormControl>
            <SelectBox
              options={options}
              placeholder="Select"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                onFieldChange(sessionKey, val);
              }}
              wrapperClass="w-full"
              className="h-10 text-sm sm:h-11"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EyePrescriptionSection({
  side,
  control,
  onFieldChange,
}: {
  side: EyeSide;
  control: PrescriptionFormProps["control"];
  onFieldChange: (name: string, val: string) => void;
}) {
  return (
    <section
      className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4"
      aria-labelledby={`prescription-${side}-heading`}
    >
      <h3
        id={`prescription-${side}-heading`}
        className="mb-3 text-sm font-semibold sm:text-base"
      >
        {EYE_LABELS[side]}
      </h3>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4">
        {EYE_FIELDS.map(({ suffix, label, options, sessionKey }) => {
          const name = `prescription.${side}_${suffix}` as PrescriptionFieldName;
          const storageKey = `${side}_${sessionKey}`;
          return (
            <PrescriptionSelectField
              key={name}
              control={control}
              name={name}
              label={label}
              options={options}
              sessionKey={storageKey}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </section>
  );
}

/** Wide table layout for md+ screens (matches original desktop UX). */
function PrescriptionTable({
  control,
  onFieldChange,
}: {
  control: PrescriptionFormProps["control"];
  onFieldChange: (name: string, val: string) => void;
}) {
  const renderCell = (
    side: EyeSide,
    suffix: string,
    options: InputOption[],
    sessionKey: string,
  ) => {
    const name = `prescription.${side}_${suffix}` as PrescriptionFieldName;
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <SelectBox
                options={options}
                placeholder="Please Select"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  onFieldChange(`${side}_${sessionKey}`, val);
                }}
                wrapperClass="w-full min-w-[7rem]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const rows: { side: EyeSide; label: string }[] = [
    { side: "right", label: "Right OD" },
    { side: "left", label: "Left OS" },
  ];

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="px-2 py-3 font-medium">#</th>
            {EYE_FIELDS.map((f) => (
              <th key={f.suffix} className="px-2 py-3 font-medium">
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ side, label }) => (
            <tr key={side} className="border-b border-border/60">
              <td className="px-2 py-3 text-sm font-bold">{label}</td>
              {EYE_FIELDS.map((f) => (
                <td key={f.suffix} className="px-2 py-3 align-top">
                  {renderCell(side, f.suffix, f.options, f.sessionKey)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  open,
  onOpenChange,
  control,
}) => {
  const { value: purchaseStore, setValue: setPurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");

  const handleDiscardClick = () => {
    if (purchaseStore) {
      const newPurchaseStoreData = purchaseStore.data;
      delete newPurchaseStoreData?.prescription;
      setPurchaseStore({
        step: purchaseStore?.step,
        data: newPurchaseStoreData,
      });
      onOpenChange(false);
    }
  };

  const handleFieldChange = (name: string, val: string) => {
    setPurchaseStore((prev) => {
      return {
        ...prev,
        data: {
          ...prev.data,
          prescription: {
            ...(prev?.data?.prescription && prev?.data?.prescription),
            [name]: val,
          },
        },
      } as PurchaseStore;
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "flex max-h-[min(90dvh,100%)] w-[calc(100vw-1.5rem)] max-w-[900px] flex-col gap-0 overflow-hidden p-0 sm:w-full",
        "max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none",
      )}
    >
      <h2 className="shrink-0 border-b px-4 py-3 text-center text-lg font-bold sm:px-6 sm:py-4 sm:text-2xl">
        Fill the prescription details
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-4 md:hidden">
          <EyePrescriptionSection
            side="right"
            control={control}
            onFieldChange={handleFieldChange}
          />
          <EyePrescriptionSection
            side="left"
            control={control}
            onFieldChange={handleFieldChange}
          />
        </div>

        <PrescriptionTable control={control} onFieldChange={handleFieldChange} />
      </div>

      <DialogFooter
        className={cn(
          "shrink-0 gap-2 border-t bg-background px-4 py-3 sm:px-6",
          "flex-col-reverse sm:flex-row sm:justify-end",
        )}
      >
        <Button
          onClick={() => handleDiscardClick()}
          type="button"
          variant="ghost"
          className="h-11 w-full sm:h-10 sm:w-auto"
        >
          I want to upload the photo
        </Button>
        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
            toast({title: "Prescription saved", description: "Prescription saved successfully", variant: "success"})
          }}
          className="h-11 w-full sm:h-10 sm:w-auto"
        >
          Save Prescription
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default PrescriptionForm;
