"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import SelectBox from "@/components/ui/select-box";
import FileInput from "@/components/ui/file-input";
import FilePreview from "@/components/ui/file-input/FilePreview";
import DragDropIcon from "@/components/icons/DragDropIcon";
import { prescriptionSchema } from "@/features/select-lens/purchase.schema";
import type { IPrescription } from "@/lib/types/prescription";
import useCreatePrescription, {
  type CreatePrescriptionPayload,
} from "@/lib/mutations/account/useCreatePrescription";
import useUpdatePrescription from "@/lib/mutations/account/useUpdatePrescription";
import useUpload from "@/lib/mutations/useUpload";
import {
  add_options,
  axis_options,
  cyl_options,
  defaultFillupValues,
  sph_options,
} from "../prescription-field-options";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
export type PrescriptionEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: IPrescription | null;
};

type FormValues = z.infer<typeof prescriptionSchema>;

function defaultsFromSaved(p: IPrescription): FormValues {
  if (p.type === "fillup") {
    return {
      type: "fillup",
      right_sph: p.right_sph ?? defaultFillupValues.right_sph,
      right_cyl: p.right_cyl ?? defaultFillupValues.right_cyl,
      right_axis: p.right_axis ?? defaultFillupValues.right_axis,
      right_add: p.right_add ?? defaultFillupValues.right_add,
      left_sph: p.left_sph ?? defaultFillupValues.left_sph,
      left_cyl: p.left_cyl ?? defaultFillupValues.left_cyl,
      left_axis: p.left_axis ?? defaultFillupValues.left_axis,
      left_add: p.left_add ?? defaultFillupValues.left_add,
      comments: p.comments ?? "",
    };
  }
  return {
    type: "photo",
    image: p.image?.id ?? "",
    comments: p.comments ?? "",
  };
}

const PrescriptionEditDialog: React.FC<PrescriptionEditDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initial,
}) => {
  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();
  const { mutate: upload, isPending: uploading } = useUpload();

  const form = useForm<FormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: defaultFillupValues,
  });

  const entryMode = form.watch("type");
  const [localFile, setLocalFile] = React.useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setLocalFile(null);
      return;
    }
    if (mode === "edit" && initial) {
      form.reset(defaultsFromSaved(initial));
    } else if (mode === "create") {
      form.reset({ ...defaultFillupValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog opens / record changes
  }, [open, mode, initial?.id]);

  const setEntryMode = (v: "fillup" | "photo") => {
    setLocalFile(null);
    if (v === "fillup") {
      form.reset({ ...defaultFillupValues });
    } else {
      form.reset({ type: "photo", image: "", comments: "" });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    if (mode === "create") {
      createMutation.mutate(values as CreatePrescriptionPayload, {
        onSuccess: () => onOpenChange(false),
      });
      return;
    }
    if (!initial) return;
    if (values.type === "fillup") {
      updateMutation.mutate(
        {
          id: initial.id,
          comments: values.comments,
          right_sph: values.right_sph,
          right_cyl: values.right_cyl,
          right_axis: values.right_axis,
          right_add: values.right_add,
          left_sph: values.left_sph,
          left_cyl: values.left_cyl,
          left_axis: values.left_axis,
          left_add: values.left_add,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      updateMutation.mutate(
        {
          id: initial.id,
          comments: values.comments,
          ...(values.image !== initial.image?.id ? { image: values.image } : {}),
        },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]"
        showCloseIcon
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add prescription" : "Edit prescription"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Type</Label>
              {mode === "edit" && initial ? (
                <p className="text-sm text-muted-foreground capitalize">
                  {initial.type === "fillup" ? "Manual entry" : "Photo upload"}
                </p>
              ) : (
                <RadioGroup
                  value={entryMode}
                  onValueChange={(v) => setEntryMode(v as "fillup" | "photo")}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fillup" id="mode-fillup" />
                    <Label htmlFor="mode-fillup" className="font-normal">
                      Manual entry
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="photo" id="mode-photo" />
                    <Label htmlFor="mode-photo" className="font-normal">
                      Photo upload
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            {entryMode === "fillup" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" cellPadding={10}>
                  <thead>
                    <tr className="border-b text-left">
                      <th>#</th>
                      <th>Sphere (SPH)</th>
                      <th>Cylinder (CYL)</th>
                      <th>Axis</th>
                      <th>Add</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium">Right OD</td>
                      {(
                        [
                          "right_sph",
                          "right_cyl",
                          "right_axis",
                          "right_add",
                        ] as const
                      ).map((name) => (
                        <td key={name}>
                          <FormField
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <SelectBox
                                    options={
                                      name.includes("sph")
                                        ? sph_options
                                        : name.includes("cyl")
                                          ? cyl_options
                                          : name.includes("axis")
                                            ? axis_options
                                            : add_options
                                    }
                                    placeholder="Select"
                                    value={field.value}
                                    onChange={field.onChange}
                                    wrapperClass="min-w-[120px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-medium">Left OS</td>
                      {(
                        [
                          "left_sph",
                          "left_cyl",
                          "left_axis",
                          "left_add",
                        ] as const
                      ).map((name) => (
                        <td key={name}>
                          <FormField
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <SelectBox
                                    options={
                                      name.includes("sph")
                                        ? sph_options
                                        : name.includes("cyl")
                                          ? cyl_options
                                          : name.includes("axis")
                                            ? axis_options
                                            : add_options
                                    }
                                    placeholder="Select"
                                    value={field.value}
                                    onChange={field.onChange}
                                    wrapperClass="min-w-[120px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {entryMode === "photo" && (
              <div className="space-y-3">
                <Label>Prescription image</Label>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FileInput
                        id="rx-image"
                        value={localFile ? [localFile] : undefined}
                        onChange={(files) => {
                          if (files?.length) {
                            upload(
                              { files, name: "image" },
                              {
                                onSuccess: (uploaded) => {
                                  const first = uploaded[0];
                                  if (first?.id) {
                                    field.onChange(first.id);
                                    setLocalFile(files[0]);
                                  }
                                },
                              },
                            );
                          } else {
                            setLocalFile(null);
                            field.onChange("");
                          }
                        }}
                        className="w-full"
                      >
                        <FilePreview
                          file={localFile}
                          defaultValue={
                            initial?.image?.url && !localFile
                              ? {
                                  url: initial.image.url,
                                  type: "image/jpeg",
                                }
                              : undefined
                          }
                          className="min-h-40"
                        >
                          <div className="grid place-content-center gap-2 py-10 text-center text-muted-foreground">
                            <DragDropIcon className="mx-auto" />
                            <span>Drop image or click to upload</span>
                          </div>
                        </FilePreview>
                      </FileInput>
                      {(Boolean(field.value) || Boolean(initial?.image?.id)) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            field.onChange("");
                            setLocalFile(null);
                          }}
                        >
                          Replace image
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <Label>Comments (optional)</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || uploading}>
                {mode === "create" ? "Save" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionEditDialog;
