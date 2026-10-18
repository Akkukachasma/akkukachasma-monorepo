"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { resetStore, showModal } from "@/store/lens-details/form.slice";
import FileInput from "../ui/file-input";
import FilePreview from "../ui/file-input/FilePreview";
import DragDropIcon from "../icons/DragDropIcon";
import { lensDetailSchema } from "@/lib/validations/admin/lens-details.validation";
import useUpdateLensDetail from "@/lib/mutations/admin/lens-details/useUpdateLensDetail";
import useCreateLensDetail from "@/lib/mutations/admin/lens-details/useCreateLensDetail";
import Combobox, { ComboboxOption } from "../ui/combo-box";
import useLensFeatures from "@/lib/queries/admin/lens-features/useLensFeatures";
import { Checkbox } from "../ui/checkbox";
import useUpload from "@/lib/mutations/useUpload";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const LensDetailForm: React.FC = () => {
  const form = useForm<z.infer<typeof lensDetailSchema>>({
    defaultValues: {
      title: "",
      crack_resistant: 0,
      hydrophobic: 0,
      lens_feature_id: "",
      lens_id: "",
      power_range: "",
      price: 0,
      thickness: 0,
      warranty_period: 0,
      uv_protection: false,
      anti_reflection: false,
      blue_light_blocker: false,
    },
    mode: "onBlur",
    resolver: zodResolver(lensDetailSchema),
  });

  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("lens_detail_image");

  const { mutate: upload, isPending: uploading } = useUpload();

  const dispatch = useAppDispatch();

  const { data, lens_detail_id } = useAppSelector(
    (store) => store.lensDetailStore.formStore,
  );

  const { mutate: updateLensDetail, isPending: updating } = useUpdateLensDetail(
    () => {
      form.reset();
    },
  );

  const { mutate: createLensDetail, isPending: creating } = useCreateLensDetail(
    () => {
      form.reset();
    },
  );

  const isPending = updating || creating;

  // create options for power type
  const { data: lensFeatures } = useLensFeatures({ completeFetch: true });
  const lens_feature_options: ComboboxOption[] =
    lensFeatures?.map((pt) => ({
      value: pt.id || "",
      label: pt.title || "",
    })) || [];

  const onSubmit = (data: z.infer<typeof lensDetailSchema>) => {
    if (lens_detail_id) {
      updateLensDetail(data);
    } else {
      createLensDetail(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data?.title,
        lens_feature_id: data?.lens_feature_id,
        anti_reflection: data?.anti_reflection || false,
        blue_light_blocker: data?.blue_light_blocker || false,
        crack_resistant: data?.crack_resistant || 0,
        hydrophobic: data?.hydrophobic || 0,
        lens_id: data?.lens_id || "",
        power_range: data?.power_range || "",
        price: data?.price || 0,
        thickness: data?.thickness || 0,
        uv_protection: data?.uv_protection || false,
        warranty_period: data?.warranty_period || 0,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="col-span-1 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="lens_feature_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Lens Feature</FormLabel>
                    <FormControl>
                      <Combobox
                        options={lens_feature_options}
                        placeholder="Select lens feature"
                        value={field.value}
                        onChange={field.onChange}
                        className="!w-full"
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
                name="power_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power Range</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter power range" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thickness</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter thickness"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lens_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lens ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lens id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Period</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter warranty in months"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crack_resistant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breakage / Crack Resistance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter in %"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hydrophobic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hydrophobic</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter in %"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="blue_light_blocker"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Blue Light Blocker</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anti_reflection"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Anti Reflection</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uv_protection"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">UV Protection</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() =>
              dispatch(lens_detail_id ? resetStore() : showModal(false))
            }
            variant="secondary"
          >
            {lens_detail_id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={lens_detail_id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default LensDetailForm;
