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
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formSchema } from "@/lib/validations/admin/coupon-manager.validation";
import dayjs from "@/lib/dayjs";
import { resetStore, showModal } from "@/store/coupon-manager/form.slice";
import useUpdate from "@/lib/mutations/admin/coupon-manager/useUpdate";
import useCreate from "@/lib/mutations/admin/coupon-manager/useCreate";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const CouponForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      discount_type: "FIXED",
      discount_value: 0,
      minimum_order: 0,
      name: "",
      per_user_limit: 0,
      quantity: 0,
      valid_from: "",
      valid_till: "",
    },
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });

  const dispatch = useAppDispatch();

  const { data, item_id } = useAppSelector(
    (store) => store.couponStore.formStore
  );

  const { mutate: update, isPending: updating } = useUpdate();

  const { mutate: create, isPending: creating } = useCreate();

  const isPending = updating || creating;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (item_id) {
      update(data);
    } else {
      create(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name?.toUpperCase(),
        discount_type: data?.discount_type,
        discount_value: data?.discount_value,
        minimum_order: data?.minimum_order,
        per_user_limit: data?.per_user_limit,
        quantity: data?.quantity,
        valid_from: data?.valid_from
          ? dayjs(data?.valid_from).format("YYYY-MM-DD")
          : "",
        valid_till: data?.valid_till
          ? dayjs(data?.valid_till).format("YYYY-MM-DD")
          : "",
      });
    }
  }, [data, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Title input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valid_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid From</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valid_till"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Till</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimum_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Total redemptions available. Use 0 for unlimited.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="per_user_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Per User Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  How many times a single user can avail this coupon.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Discount Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="FIXED" />
                      </FormControl>
                      <FormLabel className="font-normal">Fixed</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PERCENT" />
                      </FormControl>
                      <FormLabel className="font-normal">Percentage</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(+e.target.value) ? 0 : +e.target.value
                      )
                    }
                  />
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

export default CouponForm;
