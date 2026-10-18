"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormGroup,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  formSchema,
  frameSizes,
  FrameStyle,
  frameStyles,
  Gender,
  genderOptions,
  tags,
} from "@/lib/validations/admin/product.validation";
import { resetStore, showModal } from "@/store/products/form.slice";
import useUpdate from "@/lib/mutations/admin/products/useUpdate";
import useCreate from "@/lib/mutations/admin/products/useCreate";
import { Textarea } from "../ui/textarea";
import MultiSelect, {
  OptionTemplateProps,
  PreviewTemplateProps,
} from "../ui/multi-select";
import SelectBox from "../ui/select-box";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import { ICategory } from "../categories/ListItem";
import { IFrameMaterial } from "../frame-materials/FrameMaterial";
import { IShape } from "../shapes/ListItem";
import { IColor } from "../colors/ListItem";
import { IPowerType } from "../power-types/PowerType";
import { Cross2Icon } from "@radix-ui/react-icons";
import MultiTextInput from "../ui/mult-text-input";
import ColorGroupInput from "../ui/color-group-input";

const ItemForm: React.FC = () => {
  const product = useAppSelector((store) => store.productStore.formStore.data);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      category_id: "",
      slug: "",
      ...(product && { color_ids: [] }),
      description: "",
      frame_material_id: "",
      frame_size: [],
      frame_style: FrameStyle.FULL_FRAME,
      frame_width: 0,
      raw_material_sourced_from: "Imported International",
      gender: Gender.MALE,
      lens_height: 0,
      lens_width: 0,
      lens_material: "Demo Polycarbonate",
      listing_price: 0,
      model_name: "",
      power_type_ids: [],
      price: 0,
      seo_title: "",
      shape_id: "",
      tags: [],
    },
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const { data: categoriesData, isLoading: categoriesDataLoading } = useFetch<
    ICategory[]
  >({
    endpoint: ENDPOINTS.admin.categories.fetch_all(),
  });

  const { data: frameMaterialsData, isLoading: frameMaterialsLoading } =
    useFetch<IFrameMaterial[]>({
      endpoint: ENDPOINTS.admin.frame_materials.fetch_all(),
    });

  const { data: shapesData, isLoading: shapesDataLoading } = useFetch<IShape[]>(
    {
      endpoint: ENDPOINTS.admin.shapes.fetch_all(),
    },
  );
  const { data: colorData, isLoading: colorDataLoading } = useFetch<IColor[]>({
    endpoint: ENDPOINTS.admin.colors.fetch_all(),
  });

  const { data: powerData, isLoading: powerDataLoading } = useFetch<
    IPowerType[]
  >({
    endpoint: ENDPOINTS.admin.power_types.fetch_all(),
  });

  const dispatch = useAppDispatch();

  const { mutate: update, isPending: updating } = useUpdate();

  const { mutate: create, isPending: creating } = useCreate();

  const isPending = updating || creating;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (product?.id) {
      update(data);
    } else {
      create(data);
    }
  };

  React.useEffect(() => {
    if (product) {
      form.reset({
        category_id: product.category_id,
        description: product.description,
        frame_material_id: product.frame_material_id,
        frame_size: product.frame_size,
        frame_style: product.frame_style,
        frame_width: product.frame_width,
        raw_material_sourced_from: product.raw_material_sourced_from,
        gender: product.gender,
        lens_height: product.lens_height,
        lens_width: product.lens_width,
        lens_material: product.lens_material,
        listing_price: product.listing_price,
        model_name: product.model_name,
        power_type_ids: product.power_type_ids,
        price: product.price,
        seo_title: product.seo_title,
        shape_id: product.shape_id,
        tags: product.tags,
        slug: product.slug,
      });
    }
  }, [product, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Title input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* model name */}
          <FormField
            control={form.control}
            name="model_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter model name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of model name */}

          {/* product slug as unique identifier  */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter slug for the product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of slug */}

          {/* gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <SelectBox
                    options={genderOptions}
                    placeholder="Select gender"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  The gender this product is for
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of gender */}

          {/* raw material sourced from */}
          <FormField
            control={form.control}
            name="raw_material_sourced_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Material Sourced From</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of raw material sourced from */}

          {/* Category starts */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <SelectBox
                    options={
                      categoriesDataLoading
                        ? []
                        : (categoriesData?.map((cat) => ({
                            label: cat?.title ?? "Unknown",
                            value: cat?.id ?? "",
                          })) ?? [])
                    }
                    placeholder="Select category"
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Category ends */}

          {/* shape starts */}
          <FormField
            control={form.control}
            name="shape_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shape</FormLabel>
                <FormControl>
                  <SelectBox
                    options={
                      shapesDataLoading
                        ? []
                        : (shapesData?.map((shape) => ({
                            label: shape?.title ?? "Unknown",
                            value: shape?.id ?? "",
                          })) ?? [])
                    }
                    placeholder="Select Shape"
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* shape ends */}

          {/* color start */}
          {!product && (
            <FormField
              control={form.control}
              name="color_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <ColorGroupInput
                      value={field.value?.map((group) =>
                        group?.map((color) => {
                          const c = colorData?.find((cd) => cd.id === color);
                          return { id: c?.id || "", color: c?.color || "" };
                        }),
                      )}
                      onChange={(groups) => {
                        field.onChange(
                          groups.map((group) => group.map((color) => color.id)),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* color ends */}

          {/* power type start */}
          <FormField
            control={form.control}
            name="power_type_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Power Types</FormLabel>
                <FormControl>
                  <MultiSelect
                    id="power_type_ids"
                    options={
                      powerDataLoading
                        ? []
                        : (powerData?.map((power) => ({
                            label: power?.title ?? "Unknown",
                            value: power?.id ?? "",
                          })) ?? [])
                    }
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* power types ends */}
        </div>

        <FormGroup label="Pricing">
          {/* listing price */}
          <FormField
            control={form.control}
            name="listing_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of listing price */}

          {/* selling price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  The price to sell this product at.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of selling price */}
        </FormGroup>

        <FormGroup label="Frame Information">
          {/* frame width */}
          <FormField
            control={form.control}
            name="frame_width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>frame width (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of frame width */}

          {/* frame style */}
          <FormField
            control={form.control}
            name="frame_style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frame Style</FormLabel>
                <FormControl>
                  <SelectBox
                    options={frameStyles}
                    placeholder="Select frame style"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* frame style ends */}

          {/* Frame material starts */}
          <FormField
            control={form.control}
            name="frame_material_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frame Material</FormLabel>
                <FormControl>
                  <SelectBox
                    options={
                      frameMaterialsLoading
                        ? []
                        : (frameMaterialsData?.map((mat) => ({
                            label: mat?.title ?? "Unknown",
                            value: mat?.id ?? "",
                          })) ?? [])
                    }
                    placeholder="Select Material"
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Frame material ends */}

          {/* frame size  starts*/}
          <FormField
            control={form.control}
            name="frame_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frame Size</FormLabel>
                <FormControl>
                  <MultiSelect
                    id="frame-sizes"
                    options={frameSizes}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* frame size ends */}
        </FormGroup>

        <FormGroup label="Lens Information">
          {/* lens width */}
          <FormField
            control={form.control}
            name="lens_width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lens Width (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of lens width */}

          {/* lens height */}
          <FormField
            control={form.control}
            name="lens_height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lens Height (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of lens height */}

          {/* raw material sourced from */}
          <FormField
            control={form.control}
            name="lens_material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lens Material</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of lens material */}
        </FormGroup>

        <FormGroup label="Meta Details" className="flex flex-col gap-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* seo title */}
            <FormField
              control={form.control}
              name="seo_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the title for seo purposes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* end of seo title */}

            {/* tags start */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiTextInput
                      id="tags"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Type comma to add a tag.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* tags ends */}
          </div>
          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the description here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* end of description */}
        </FormGroup>

        {/* Footer with buttons */}
        <DialogFooter>
          <Button
            type="button"
            onClick={() =>
              dispatch(product?.id ? resetStore() : showModal(false))
            }
            variant="secondary"
          >
            {product?.id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={product?.id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const ColorOptionTemplate: React.FC<OptionTemplateProps<IColor>> = ({
  onSelect,
  label,
  data,
}) => {
  return (
    <div
      onClick={() => onSelect()}
      className="flex items-center gap-2 p-2 animate-smooth rounded hover:bg-primary/10 hover:text-primary cursor-pointer"
    >
      <span
        className="size-6 flex-shrink-0"
        style={{ backgroundColor: data?.color || "" }}
      />
      <span className="mr-2">{label}</span>
    </div>
  );
};

export const ColorPreviewTemplate: React.FC<PreviewTemplateProps<IColor>> = ({
  onRemove,
  data,
}) => {
  return (
    <div
      style={{ backgroundColor: `${data?.color}20`, color: data?.color }}
      className="flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-medium"
    >
      <span
        className="size-4 rounded-md flex-shrink-0"
        style={{ backgroundColor: data?.color || "" }}
      />
      {data?.name}
      <button
        type="button"
        className="text-destructive"
        onClick={() => onRemove()}
      >
        <Cross2Icon className="size-3" />
      </button>
    </div>
  );
};

export default ItemForm;
