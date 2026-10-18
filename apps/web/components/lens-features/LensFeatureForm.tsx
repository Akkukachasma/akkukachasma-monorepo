"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetStore, showModal } from "@/store/lens-features/form.slice";

import { lensFeatureSchema } from "@/lib/validations/admin/lens-feature.validation";
import useUpdateLensFeature from "@/lib/mutations/admin/lens-features/useUpdateLensFeatures";
import useCreateLensFeature from "@/lib/mutations/admin/lens-features/useCreateLensFeatures";
import Combobox, { ComboboxOption } from "../ui/combo-box";
import usePowerTypes from "@/lib/queries/admin/power-types/usePowerTypes";
import FilePreview from "../ui/file-input/FilePreview";
import DragDropIcon from "../icons/DragDropIcon";
import FileInput from "../ui/file-input";
import useUpload from "@/lib/mutations/useUpload";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const LensFeatureForm: React.FC = () => {
  const form = useForm<z.infer<typeof lensFeatureSchema>>({
    defaultValues: { image: null, description: "", title: "" },
    mode: "onBlur",
    resolver: zodResolver(lensFeatureSchema),
  });

  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("lens_feature_image");

  const dispatch = useAppDispatch();

  const { data, lens_feature_id } = useAppSelector(
    (store) => store.lensFeatureStore.formStore,
  );

  const { mutate: upload, isPending: uploading } = useUpload();

  const { mutate: updateLensFeature, isPending: updating } =
    useUpdateLensFeature();

  const { mutate: createLensFeature, isPending: creating } =
    useCreateLensFeature();

  const isPending = updating || creating;

  // create options for power type
  const { data: powerTypes } = usePowerTypes({ completeFetch: true });
  const power_type_options: ComboboxOption[] =
    powerTypes?.map((pt) => ({
      value: pt.id || "",
      label: pt.title || "",
    })) || [];

  const onSubmit = (data: z.infer<typeof lensFeatureSchema>) => {
    if (lens_feature_id) {
      updateLensFeature(data);
    } else {
      createLensFeature(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data?.title,
        description: data?.description,
        power_type_id: data?.power_type_id,
      });
    }
  }, [data, form]);

  React.useEffect(() => {
    if (data?.image) {
      setUploadedImage({
        id: data.image.id,
        url: data.image.url,
        fieldname: data.image.fieldname || "",
      });
    }
  }, [data]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
          {/* Image Upload */}
          <FileInput
            onChange={(files) => {
              if (
                Array.isArray(files) &&
                !isNaN(files?.length) &&
                files?.length > 0
              ) {
                upload(
                  { files, name: "image" },
                  {
                    onSuccess: (data) => {
                      setUploadedImage({
                        id: data[0].id,
                        url: data[0].url,
                        fieldname: data[0].fieldname,
                        is_temp: data[0].is_temp,
                      });
                    },
                  },
                );
              }
            }}
            className="size-[100px]"
          >
            <FilePreview
              file={null}
              {...(uploadedImage && {
                defaultValue: {
                  type: "image",
                  url: uploadedImage?.url,
                },
              })}
              className="size-full grid place-content-center"
            >
              <DragDropIcon className="size-[25px]" />
            </FilePreview>
          </FileInput>

          <FormField
            control={form.control}
            name="power_type_id"
            render={({ field }) => (
              <FormItem className="flex gap-4 items-center">
                <FormLabel className="flex-shrink-0">Power Type</FormLabel>
                <FormControl>
                  <Combobox
                    options={power_type_options}
                    placeholder="Select power type"
                    value={field.value}
                    onChange={field.onChange}
                    className="flex-grow"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {lens_feature_id ? "Discard" : "Cancel"}
            </Button>
          </DialogClose>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={lens_feature_id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default LensFeatureForm;
