"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button, ProcessIndicator } from "../ui/button";
import FileInput from "../ui/file-input";
import FilePreview from "../ui/file-input/FilePreview";
import DragDropIcon from "../icons/DragDropIcon";
import React from "react";
import useUpload from "@/lib/mutations/useUpload";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile, IUser } from "@/lib/types";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import { Input } from "../ui/input";
import { z } from "zod";
import { formSchema } from "@/lib/validations/account.validations";
import useUpdateProfile from "@/lib/mutations/account/useUpdateProfile";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

const UserProfileForm = () => {
  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("avatar");
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "all",
    defaultValues: {
      name: "",
      phone_number: "",
    },
  });
  const { data, isLoading } = useFetch<IUser>({
    endpoint: ENDPOINTS.AUTH.details,
  });
  const { mutate: upload, isPending: uploading } = useUpload();
  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = form;

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isDirty || uploadedImage?.is_temp) {
      updateProfile(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? "",
        phone_number: data.phone_number ?? "",
      });
    }
  }, [data, reset]);

  React.useEffect(() => {
    if (data?.avatar) {
      setUploadedImage({
        id: data.avatar.id,
        url: data.avatar.url,
        fieldname: data.avatar.fieldname || "",
      });
    }
  }, [data]);

  if (isLoading) {
    return <UserProfileFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "max-w-[500px] flex flex-col gap-6",
          isPending && "pointer-events-none",
        )}
      >
        <div className="portal-surface space-y-6 p-4 sm:p-5">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
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
              className="size-[100px] flex-shrink-0 rounded-full ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-background"
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
            <div className="flex w-full flex-grow flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-stretch sm:justify-end">
            <Button
              type={isPending ? "button" : "submit"}
              className="min-h-10 w-full min-w-24 touch-manipulation rounded-3xl bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              disabled={isPending}
            >
              <ProcessIndicator isProcessing={isPending} btnText="Save" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

const UserProfileFormSkeleton = () => {
  return (
    <div className="max-w-[500px] flex flex-col gap-6">
      <div className="portal-surface space-y-6 p-4 sm:p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
          <Skeleton className="size-[100px] flex-shrink-0 rounded-full" />
          <div className="flex w-full flex-grow flex-col gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-stretch sm:justify-end">
          <Skeleton className="h-10 w-full rounded-3xl sm:w-24" />
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
