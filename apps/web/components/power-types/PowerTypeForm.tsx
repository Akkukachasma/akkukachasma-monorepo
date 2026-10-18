"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import useCreatePowerType from "@/lib/mutations/admin/power-types/useCreatePowerTypes";
import { useForm } from "react-hook-form";
import { powerTypeSchema } from "@/lib/validations/admin/power-type.validation";
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
import useUpdatePowerType from "@/lib/mutations/admin/power-types/useUpdatePowerTypes";
import { resetStore, showModal } from "@/store/power-types/form.slice";
import FileInput from "../ui/file-input";
import FilePreview from "../ui/file-input/FilePreview";
import DragDropIcon from "../icons/DragDropIcon";
import useUpload from "@/lib/mutations/useUpload";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const PowerTypeForm: React.FC = () => {
  const {
    value: uploadedImage,
    setValue: setUploadedImage,
    removeValue: removeUploadedImageFromSession,
  } = useSessionStorage<IFile>("power_type_image");

  const { mutate: upload, isPending: uploading } = useUpload();

  const form = useForm<z.infer<typeof powerTypeSchema>>({
    defaultValues: { image: null, description: "", title: "" },
    mode: "onBlur",
    resolver: zodResolver(powerTypeSchema),
  });

  const dispatch = useAppDispatch();
  const { data, power_type_id } = useAppSelector(
    (store) => store.powerTypeStore.formStore,
  );

  const { mutate: updatePowerType, isPending: updating } = useUpdatePowerType(
    () => {
      form.reset();
    },
  );

  const { mutate: createPowerType, isPending: creating } = useCreatePowerType(
    () => {
      form.reset();
    },
  );

  const isPending = updating || creating;

  const onSubmit = (data: z.infer<typeof powerTypeSchema>) => {
    if (power_type_id) {
      updatePowerType(data);
    } else {
      createPowerType(data);
    }
  };

  const handleDiscard = () => {
    if (power_type_id) {
      // means we are updating the record
      dispatch(resetStore());
      // remove the image from session so that it don't come up in non image powertype when editing them...
      removeUploadedImageFromSession();
    } else {
      dispatch(showModal(false));
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({ title: data?.title, description: data?.description });
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
          <Button
            type="button"
            onClick={() => handleDiscard()}
            variant="secondary"
          >
            {power_type_id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={power_type_id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PowerTypeForm;
