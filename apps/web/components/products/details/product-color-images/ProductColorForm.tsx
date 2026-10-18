import { IColor } from "@/components/colors/ListItem";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";
import { productColorSchema } from "@/lib/validations/admin/product.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ColorOptionTemplate, ColorPreviewTemplate } from "../../ItemForm";
import { useAppSelector } from "@/store";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button, ProcessIndicator } from "@/components/ui/button";
import useCreate from "@/lib/mutations/admin/products/product-colors/useCreate";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import useUpdate from "@/lib/mutations/admin/products/product-colors/useUpdate";
const ProductColorForm = () => {
  const params = useParams<{ product_id: string }>();
  const form = useForm<z.infer<typeof productColorSchema>>({
    mode: "all",
    defaultValues: {
      model_number: "",
      stock_quantity: 0,
      color_ids: [],
    },
    resolver: zodResolver(productColorSchema),
  });
  const { handleSubmit, reset } = form;
  const dataToEdit = useAppSelector(
    (store) => store.productStore.productColorStore.data,
  );
  const { data: colorData, isLoading: colorDataLoading } = useFetch<IColor[]>({
    endpoint: ENDPOINTS.admin.colors.fetch_all(),
  });

  const { mutate: create, isPending: creating } = useCreate(params?.product_id);
  const { mutate: update, isPending: updating } = useUpdate();
  const isPending = creating || updating;

  const onSubmit = (data: z.infer<typeof productColorSchema>) => {
    console.log("see this", data);
    if (dataToEdit) {
      // means we need to update the form
      update(data);
    } else {
      // create the product here...
      create(data);
    }
  };

  React.useEffect(() => {
    if (dataToEdit) {
      // means the form is in edit mode....
      reset({
        model_number: dataToEdit.model_number || "",
        stock_quantity: dataToEdit.stock_quantity || 0,
        color_ids: dataToEdit.colors?.map((c) => c.id),
      });
    }
  }, [dataToEdit, reset]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex flex-col gap-4",
          isPending && "pointer-events-none",
        )}
      >
        <FormField
          control={form.control}
          name="model_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter model number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>In Stock</FormLabel>
              <FormControl>
                <Input
                  placeholder="How many products are there in stock?"
                  type="number"
                  min={0}
                  {...field}
                  onChange={(event) => {
                    const value = event.target.value;
                    const numericValue = Number(value);
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
        {!colorDataLoading && Array.isArray(colorData) && (
          <FormField
            control={form.control}
            name="color_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors</FormLabel>
                <FormControl>
                  <MultiSelect
                    id="color_ids"
                    options={colorData.map((color) => ({
                      label: color?.name ?? "Unknown",
                      value: color?.id ?? "",
                      data: color,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    optionTemplate={ColorOptionTemplate}
                    previewTemplate={ColorPreviewTemplate}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter className="items-center gap-4">
          <DialogClose>Discard</DialogClose>
          <Button>
            <ProcessIndicator
              btnText={dataToEdit ? "Save" : "Create"}
              isProcessing={isPending}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ProductColorForm;
