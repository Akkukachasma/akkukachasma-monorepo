import { z } from "zod";

export const lensDetailSchema = z.object({
  image: z.string().optional(),
  lens_id: z.string().min(1, { message: "Please provide lens id." }),
  lens_feature_id: z
    .string()
    .min(1, { message: "Please select a lens feature." }),
  title: z.string().min(1, { message: "Please enter a title" }),
  price: z.number().min(0.001, { message: "Price must not be zero." }),
  thickness: z.number().min(0.001, { message: "Thickness must not be zero." }),
  power_range: z.string().optional(),
  warranty_period: z
    .number()
    .min(0, { message: "Warranty period must not be less than zero." }),
  blue_light_blocker: z.boolean().default(false).optional(),
  crack_resistant: z
    .number()
    .min(0, {
      message: "Breakage and crack resistance must not be less than 0%.",
    })
    .optional(),
  hydrophobic: z
    .number()
    .min(0, {
      message: "This value must not be less than 0%.",
    })
    .optional(),
  anti_reflection: z.boolean().default(false).optional(),
  uv_protection: z.boolean().default(false).optional(),
});
