import { isValidObjectId } from "@/lib/utils";
import { z } from "zod";

export const prescriptionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("photo"),
    image: z.string(),
    comments: z.string(),
  }),
  z.object({
    type: z.literal("fillup"),
    right_sph: z.string(),
    right_cyl: z.string(),
    right_axis: z.string(),
    right_add: z.string(),
    left_sph: z.string(),
    left_cyl: z.string(),
    left_axis: z.string(),
    left_add: z.string(),
    comments: z.string(),
  }),
]);
export const purchaseSchema = z.object({
  power_type_id: z
    .string()
    .refine(isValidObjectId, {
      message: "Invalid MongoDB ObjectId format",
    })
    .optional(),
  lens_feature_id: z
    .string()
    .refine(isValidObjectId, {
      message: "Invalid MongoDB ObjectId format",
    })
    .optional(),
  lens_detail_id: z
    .string()
    .refine(isValidObjectId, {
      message: "Invalid MongoDB ObjectId format",
    })
    .optional(),
  product_color_id: z
    .string()
    .refine(isValidObjectId, { message: "Invalid MongoDB ObjectId format" }),
  frame_only: z.boolean().default(false),
  save_prescription: z.boolean().default(false),
  prescription: prescriptionSchema.optional(),
});
