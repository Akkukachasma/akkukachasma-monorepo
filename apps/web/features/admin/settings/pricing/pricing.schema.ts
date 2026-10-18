import { z } from "zod";

export const priceAdjustmentSchema = z
  .object({
    direction: z.enum(["increase", "decrease"]),
    mode: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive("Value must be greater than 0"),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "percentage" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage cannot be greater than 100",
        path: ["value"],
      });
    }
  });

export type PriceAdjustmentFormValues = z.infer<typeof priceAdjustmentSchema>;
