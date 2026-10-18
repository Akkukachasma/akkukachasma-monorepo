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
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore, showModal } from "@/store/banners/form.slice";
import useUpdate from "@/lib/mutations/admin/banners/useUpdate";
import useCreate from "@/lib/mutations/admin/banners/useCreate";
import { formSchema } from "@/lib/validations/admin/banners.validation";
import { Checkbox } from "../ui/checkbox";
import MultiSelect from "../ui/multi-select";
import useCategories from "@/lib/queries/admin/categories/useItems";
import useShapes from "@/lib/queries/admin/shapes/useItems";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { Input } from "../ui/input";
import SelectBox from "../ui/select-box";
import { BANNER_ASPECT_RATIO_OPTIONS } from "@/lib/constants/banner-aspect-ratios";

const ItemForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      category_ids: [],
      shape_ids: [],
      is_active: false,
      title: "",
      show_on_home: false,
      aspect_ratio: "landscape",
      slides_per_view: 3,
    },
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });
  const { isDirty } = form.formState;

  const dispatch = useAppDispatch();
  const { data: storeData } = useAppSelector(
    (store) => store.bannerStore.formStore,
  );

  const { mutate: updateBanner, isPending: updating } = useUpdate();
  const { mutate: createBanner, isPending: creating } = useCreate();
  const isPending = updating || creating;

  // prepare category data
  const {
    data: categories,
    isLoading: categoryLoading,
    hasNextPage: categoryHasNextPage,
    fetchNextPage: categoryFetchNextPage,
    isFetchingNextPage: categoryIsFetchingNextPage,
  } = useCategories();

  const categoryElementRef = useInfiniteScroll({
    hasNextPage: categoryHasNextPage,
    fetchNextPage: categoryFetchNextPage,
    isLoading: categoryLoading,
    isFetchingNextPage: categoryIsFetchingNextPage,
  });

  const categoryOptions =
    categories?.map((category) => ({
      label: category.title,
      value: category.id,
    })) || [];

  //prepare shape options
  const {
    data: shapes,
    isLoading: shapeLoading,
    hasNextPage: shapeHasNextPage,
    fetchNextPage: shapeFetchNextPage,
    isFetchingNextPage: shapeIsFetchingNextPage,
  } = useShapes();

  const shapeElementRef = useInfiniteScroll({
    hasNextPage: shapeHasNextPage,
    fetchNextPage: shapeFetchNextPage,
    isLoading: shapeLoading,
    isFetchingNextPage: shapeIsFetchingNextPage,
  });

  const shapeOptions =
    shapes?.map((shape) => ({
      label: shape.title,
      value: shape.id,
    })) || [];

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isDirty) {
      if (storeData?.id) {
        updateBanner(data);
      } else {
        createBanner(data);
      }
    } else {
      dispatch(resetStore());
    }
  };

  React.useEffect(() => {
    if (storeData) {
      form.reset({
        is_active: storeData?.is_active,
        show_on_home: storeData?.show_on_home,
        category_ids: storeData?.category_ids || [],
        shape_ids: storeData?.shape_ids || [],
        title: storeData?.title || "",
        type: storeData?.type,
        aspect_ratio: storeData?.aspect_ratio || "landscape",
        slides_per_view: storeData?.slides_per_view ?? 3,
      });
    }
  }, [storeData, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Title input */}
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SelectBox
                    options={[
                      { value: "masonry", label: "Masonry" },
                      { value: "grid", label: "Grid" },
                      { value: "carousel", label: "Carousel" },
                      { value: "slider", label: "Slider" },
                    ]}
                    placeholder="Select Banner Type"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aspect_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect Ratio</FormLabel>
                <FormControl>
                  <SelectBox
                    options={BANNER_ASPECT_RATIO_OPTIONS?.map(baro => ({ value: baro.value, label: baro.label }))}
                    placeholder="Select Aspect Ratio"
                    value={field.value ?? "landscape"}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("type") === "slider" && (
            <FormField
              control={form.control}
              name="slides_per_view"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slides per view</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={6}
                      className="max-w-[120px]"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : Number(v));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Title</FormLabel>
                <FormControl>
                  <Input type="text" className="max-w-[400px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Active</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_on_home"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Show on Home</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="category_ids"
              render={({ field }) => (
                <FormItem className="w-full max-w-72">
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      id="category_ids"
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                      optionRef={categoryElementRef as any}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shape_ids"
              render={({ field }) => (
                <FormItem className="w-full max-w-72">
                  <FormLabel>Shapes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      id="shape_ids"
                      options={shapeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      optionRef={shapeElementRef as any}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Footer with buttons */}
        <DialogFooter>
          <Button
            type="button"
            onClick={() =>
              dispatch(storeData?.id ? resetStore() : showModal(false))
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
