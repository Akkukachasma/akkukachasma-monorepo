import { z } from "zod";

export const FRANCHISE_OWNER_VALUES = ["owner", "renter", "other"] as const;
export const FRANCHISE_NEARBY_VALUES = [
  "market",
  "college",
  "shop",
  "other",
] as const;

export type FranchiseOwnerValue = (typeof FRANCHISE_OWNER_VALUES)[number];
export type FranchiseNearbyValue = (typeof FRANCHISE_NEARBY_VALUES)[number];

export const franchiseRequestFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone_number: z.string().min(10, "Phone is required"),
    pincode: z.string().min(6, "Pincode is required"),
    owner: z.enum(FRANCHISE_OWNER_VALUES, {
      required_error: "Please select ownership type",
    }),
    other_owner: z.string().optional(),
    nearby: z.enum(FRANCHISE_NEARBY_VALUES, {
      required_error: "Please select what is nearby",
    }),
    other_near_by: z.string().optional(),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.owner === "other" && !data.other_owner?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your ownership situation.",
        path: ["other_owner"],
      });
    }
    if (data.nearby === "other" && !data.other_near_by?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe what is nearby.",
        path: ["other_near_by"],
      });
    }
  });

export type FranchiseRequestFormValues = z.infer<
  typeof franchiseRequestFormSchema
>;
