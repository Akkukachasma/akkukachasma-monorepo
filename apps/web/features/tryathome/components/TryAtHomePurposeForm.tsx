"use client";
import React from "react";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPurposeToEdit } from "@/features/tryathome/store";
import useCreateTryAtHomePurpose from "../mutations/useCreateTryAtHomePurpose";
import useUpdateTryAtHomePurpose from "../mutations/useUpdateTryAtHomePurpose";

const purposeFormSchema = z.object({
  label: z.string().min(1, "Purpose label is required"),
});

type PurposeFormValues = z.infer<typeof purposeFormSchema>;

const TryAtHomePurposeForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const purposeToEdit = useAppSelector(
    (state) => state.tryathomePurposes.modal.purposeToEdit,
  );

  const { mutate: createPurpose, isPending: isCreating } =
    useCreateTryAtHomePurpose();
  const { mutate: updatePurpose, isPending: isUpdating } =
    useUpdateTryAtHomePurpose();

  const form = useForm<PurposeFormValues>({
    resolver: zodResolver(purposeFormSchema),
    defaultValues: {
      label: purposeToEdit?.label || "",
    },
  });

  React.useEffect(() => {
    if (purposeToEdit) {
      form.setValue("label", purposeToEdit.label);
    } else {
      form.reset();
    }
  }, [purposeToEdit, form]);

  const onSubmit = (data: PurposeFormValues) => {
    if (purposeToEdit) {
      updatePurpose({
        id: purposeToEdit.id,
        label: data.label,
      });
    } else {
      createPurpose(data);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Purpose Label</Label>
        <Input
          id="label"
          placeholder="Enter purpose label"
          {...form.register("label")}
        />
        {form.formState.errors.label && (
          <p className="text-sm text-red-500">
            {form.formState.errors.label.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            dispatch(setPurposeToEdit(null));
            form.reset();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <ProcessIndicator
            isProcessing={isPending}
            btnText={purposeToEdit ? "Update Purpose" : "Create Purpose"}
          />
        </Button>
      </div>
    </form>
  );
};

export default TryAtHomePurposeForm;
