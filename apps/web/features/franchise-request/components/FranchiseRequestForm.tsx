"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  franchiseRequestFormSchema,
  type FranchiseRequestFormValues,
} from "../franchise-request.schema";
import useCreateFranchiseRequest from "../mutations/useCreateFranchiseRequest";

const OWNER_OPTIONS: { value: FranchiseRequestFormValues["owner"]; label: string }[] =
  [
    { value: "owner", label: "I own the premises" },
    { value: "renter", label: "Renter" },
    { value: "other", label: "Other" },
  ];

const NEARBY_OPTIONS: { value: FranchiseRequestFormValues["nearby"]; label: string }[] =
  [
    { value: "market", label: "Near a market" },
    { value: "college", label: "Near a college" },
    { value: "shop", label: "Near shops" },
    { value: "other", label: "Other" },
  ];

const FranchiseRequestForm: React.FC = () => {
  const form = useForm<FranchiseRequestFormValues>({
    resolver: zodResolver(franchiseRequestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      pincode: "",
      other_owner: "",
      other_near_by: "",
      message: "",
    },
  });

  const owner = useWatch({ control: form.control, name: "owner" });
  const nearby = useWatch({ control: form.control, name: "nearby" });

  const { mutate, isPending } = useCreateFranchiseRequest();

  const onSubmit = (data: FranchiseRequestFormValues) => {
    mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="name"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="phone_number"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  autoComplete="tel"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="pincode"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="owner"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ownership</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (v !== "other") {
                    form.setValue("other_owner", "");
                  }
                }}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OWNER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {owner === "other" && (
          <FormField
            name="other_owner"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe ownership</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Family property, lease details…"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          name="nearby"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nearby</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  if (v !== "other") {
                    form.setValue("other_near_by", "");
                  }
                }}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select what is nearby" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NEARBY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {nearby === "other" && (
          <FormField
            name="other_near_by"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe nearby area</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="What is near your location?"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          name="message"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Submitting…" : "Submit request"}
        </Button>
      </form>
    </Form>
  );
};

export default FranchiseRequestForm;
