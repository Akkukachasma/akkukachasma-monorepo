"use client";

import { useForm } from "react-hook-form";
import { TaxFormValues, formSchema } from "../tax.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCreate from "../mutations/useCreate";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import useUpdate from "../mutations/useUpdate";
import { resetStore } from "../store/ui.slice";
import SelectBox from "@/components/ui/select-box";
import MultiSelect from "@/components/ui/multi-select";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import { ICategory } from "@/components/categories/ListItem";
import useItems from "@/lib/queries/admin/categories/useItems";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

const TaxForm = () => {
  const dataToReset = useAppSelector((store) => store.invoiceTaxStore.ui.data);
  const dispatch = useAppDispatch();

  const {
    data: categories,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useItems();
  const elementRef = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  });

  const { mutate: create, isPending: creating } = useCreate();
  const { mutate: update, isPending: updating } = useUpdate(
    dataToReset?.id || "",
  );

  const isPending = creating || updating;

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      type: "OTHER",
      category_ids: [],
      percentage: 0,
    },
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  const onSubmit = (data: TaxFormValues) => {
    if (isDirty) {
      if (dataToReset) {
        update(data);
      } else {
        create(data);
      }
    } else {
      dispatch(resetStore());
    }
  };

  useEffect(() => {
    if (dataToReset) {
      reset({
        label: dataToReset.label,
        description: dataToReset.description,
        category_ids: dataToReset.category_ids,
        percentage: dataToReset.percentage,
        type: dataToReset.type,
      });
    }
  }, [dataToReset, reset]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "grid gap-4",
          isPending && "pointer-events-none opacity-90",
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Type</FormLabel>
                <FormControl>
                  <SelectBox
                    placeholder="Select a tax type"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "GST", label: "GST" },
                      { value: "VAT", label: "VAT" },
                      { value: "OTHER", label: "Other" },
                    ]}
                    wrapperClass="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <FormControl>
                  <Input placeholder="Tax Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Tax Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percentage</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tax percentage"
                  type="number"
                  pattern="^\d+(\.\d{1,2})?$"
                  min={0}
                  max={100}
                  step={0.01}
                  {...field}
                  onChange={(event) => {
                    const value = event.target.value;
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue)) {
                      field.onChange(numericValue);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <MultiSelect
                  id="multi-select-category"
                  options={
                    categories?.map((category) => ({
                      value: category.id,
                      label: category.title,
                    })) || []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  optionRef={elementRef as any}
                />
              </FormControl>
              <FormDescription>
                Select the categories to which this tax applies. Don't select
                any categories if you want this tax to apply to all categories.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="mt-4" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              {dataToReset ? "Discard" : "Cancel"}
            </Button>
          </DialogClose>
          <Button disabled={isPending} type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={dataToReset ? "Update" : "Add"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default TaxForm;
