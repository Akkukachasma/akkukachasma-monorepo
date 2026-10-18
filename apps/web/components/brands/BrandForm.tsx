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

import { formSchema } from "@/lib/validations/admin/brands.validation";
import useUpdateBrand from "@/lib/mutations/admin/brands/useUpdate";
import useCreateBrand from "@/lib/mutations/admin/brands/useCreate";
import { resetStore, showModal } from "@/store/brands/form.slice";
import { generateSlug } from "../articles/ArticleForm";

const BrandForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: { title: "", description: "" },
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const dispatch = useAppDispatch();

  const { data, item_id } = useAppSelector(
    (store) => store.brandStore.formStore,
  );

  const { mutate: updateBrand, isPending: updating } = useUpdateBrand();

  const { mutate: createBrand, isPending: creating } = useCreateBrand();

  const isPending = updating || creating;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (item_id) {
      updateBrand(data);
    } else {
      createBrand(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data?.title,
        description: data?.description,
        slug: data?.slug,
      });
    }
  }, [data, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
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
            name="description"
            control={form.control}
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

export default BrandForm;
