"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  priceAdjustmentSchema,
  type PriceAdjustmentFormValues,
} from "../pricing.schema";

type PriceAdjustmentFormProps = {
  onSubmit: (values: PriceAdjustmentFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
};

const PriceAdjustmentForm: React.FC<PriceAdjustmentFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const form = useForm<PriceAdjustmentFormValues>({
    resolver: zodResolver(priceAdjustmentSchema),
    defaultValues: {
      direction: "increase",
      mode: "percentage",
      value: 10,
      notes: "",
    },
  });

  const mode = form.watch("mode");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <p className="text-sm text-muted-foreground">
          Applies to all frame products (listing MRP and selling price). Lens
          prices are not changed.
        </p>

        <FormField
          control={form.control}
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direction</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="decrease">Decrease</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount (₹)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {mode === "percentage" ? "Percentage" : "Amount (₹)"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0.01}
                  max={mode === "percentage" ? 100 : undefined}
                  step="0.01"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {mode === "percentage"
                  ? "Must be greater than 0 and at most 100. Negatives are not allowed."
                  : "Must be greater than 0. Negatives are not allowed."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Reason for this adjustment"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Applying…" : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PriceAdjustmentForm;
