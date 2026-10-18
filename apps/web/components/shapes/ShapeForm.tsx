"use client";
import React from "react";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore, showModal } from "@/store/shapes/form.slice";
import useUpdate from "@/lib/mutations/admin/shapes/useUpdate";
import useCreate from "@/lib/mutations/admin/shapes/useCreate";
import FileInput from "../ui/file-input";
import FilePreview from "../ui/file-input/FilePreview";
import DragDropIcon from "../icons/DragDropIcon";
import TextEditor from "../ui/text-editor";
import { formSchema } from "@/lib/validations/admin/shapes.validation";
import useUpload from "@/lib/mutations/useUpload";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";
import { generateSlug } from "../articles/ArticleForm";
import MultiTextInput from "../ui/mult-text-input";

const ShapeForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      title: "",
      description: "",
      seo_title: "",
      meta_description: "",
      keywords: [],
      slug: "",
    },
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const dispatch = useAppDispatch();
  const { data, item_id } = useAppSelector(
    (store) => store.shapeStore.formStore,
  );
  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("shape_image");
  const { mutate: upload, isPending: uploading } = useUpload();
  const { mutate: updateShape, isPending: updating } = useUpdate();
  const { mutate: createShape, isPending: creating } = useCreate();
  const isPending = updating || creating;
  const {
    formState: { isDirty },
  } = form;
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isDirty || uploadedImage?.is_temp) {
      if (item_id) {
        updateShape(data);
      } else {
        createShape(data);
      }
    } else {
      dispatch(resetStore());
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data?.title,
        description: data?.description,
        seo_title: data?.seo_title,
        meta_description: data?.meta_description ?? "",
        keywords: data?.keywords ?? [],
        slug: data?.slug,
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

        {/* Title input */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title"
                    {...field}
                    onChange={(event) => {
                      form.setValue("slug", generateSlug(event.target.value));
                      field.onChange(event.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seo_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seo Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Seo Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter meta description for SEO"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <MultiTextInput
                  id="shape-keyword-input"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="text-[10px] text-secondary-foreground/50">
                ! Enter comma, for adding keyword!
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Description textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextEditor placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Footer with buttons */}
        <DialogFooter>
          <Button
            type="button"
            onClick={() => dispatch(item_id ? resetStore() : showModal(false))}
            variant="secondary"
          >
            {item_id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={item_id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ShapeForm;
