import { z } from "zod";

export const formSchema = z.object({
  label: z.string().min(1, "label is required"),
  description: z.string().max(255, "Description is too long").trim().optional(),
  type: z.enum(["GST", "VAT", "OTHER"]),
  percentage: z.number().min(0).max(100).optional(),
  category_ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export type TaxFormValues = z.infer<typeof formSchema>;
