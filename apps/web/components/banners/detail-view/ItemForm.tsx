"use client";
import React from "react";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore, showModal } from "@/store/banners/banner-image.slice";
import FileInput from "@/components/ui/file-input";
import FilePreview from "@/components/ui/file-input/FilePreview";
import DragDropIcon from "@/components/icons/DragDropIcon";
import { bannerImageSchema } from "@/lib/validations/admin/banners.validation";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";
import useUpload from "@/lib/mutations/useUpload";
import { Input } from "@/components/ui/input";
import useCreateBannerImage from "@/lib/mutations/admin/banners/useCreateBannerImage";
import { useParams } from "next/navigation";
import useUpdateBannerImage from "@/lib/mutations/admin/banners/useUpdateBannerImage";

const ItemForm: React.FC = () => {
  const params = useParams<{ id: string }>();

  const { value: uploadedImage, setValue: setUploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("banner_image");
  const form = useForm<z.infer<typeof bannerImageSchema>>({
    defaultValues: {
      url: "",
    },
    mode: "onBlur",
    resolver: zodResolver(bannerImageSchema),
  });
  const { isDirty, errors } = form.formState;

  const dispatch = useAppDispatch();
  const { data: storeData } = useAppSelector(
    (store) => store.bannerStore.bannerImageStore,
  );
  const { mutate: createBannerImage, isPending: creating } =
    useCreateBannerImage(params?.id || "");
  const { mutate: updateBannerImage, isPending: updatingBannerImage } =
    useUpdateBannerImage();
  const { mutate: upload, isPending: uploading } = useUpload();

  const isPending = creating || updatingBannerImage;

  const onSubmit = (data: z.infer<typeof bannerImageSchema>) => {
    if (isDirty) {
      if (storeData?.id) {
        updateBannerImage(data as any);
      } else {
        createBannerImage(data);
      }
    } else {
      dispatch(resetStore());
    }
  };

  

  React.useEffect(() => {
    if (storeData) {
      form.reset({
        url: storeData.url ?? "",
      });
    }
  }, [storeData, form]);

  React.useEffect(() => {
    if (storeData?.image) {
      setUploadedImage({
        id: storeData.image.id,
        url: storeData.image.url,
        fieldname: storeData.image.fieldname || "",
      });
    }
  }, [storeData]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
          className="w-full h-52"
        >
          <FilePreview
            imagePreviewSize={{ width: 1080, height: 720 }}
            file={null}
            {...(uploadedImage && {
              defaultValue: {
                type: "image",
                url: uploadedImage.url,
              },
            })}
            className="size-full"
          >
            <div className="size-full grid place-content-center">
              <DragDropIcon className="size-[25px]" />
            </div>
          </FilePreview>
        </FileInput>
        {/* Title input */}

        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input type="text" className="max-w-[400px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Footer with buttons */}
        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              dispatch(storeData?.id ? resetStore() : showModal(false));
              removeUploadedImageFromSession();
            }
            }
            variant="secondary"
          >
            {storeData?.id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={storeData?.id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ItemForm;
