import { z } from "zod";
import { addressLineSchema } from "@/lib/validations/account.validations";

export const tryAtHomeFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  message: z.string().optional(),
  address: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val || !val.trim()) return;
      const result = addressLineSchema.safeParse(val);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            result.error.issues[0]?.message ??
            "Please enter a valid street address",
        });
      }
    }),
  zip_code: z
    .string()
    .min(5, "Zip code must be at least 5 characters")
    .max(10, "Zip code must be less than 10 characters"),
  purpose_id: z.string().optional(),
});

export type TryAtHomeFormValues = z.infer<typeof tryAtHomeFormSchema>;
