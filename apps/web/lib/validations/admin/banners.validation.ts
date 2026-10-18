import { BANNER_ASPECT_RATIO_OPTIONS } from "@/lib/constants/banner-aspect-ratios";
import { z } from "zod";

const BANNER_ASPECT_RATIO_VALUES = BANNER_ASPECT_RATIO_OPTIONS.map(
  (baro) => baro.value
) as [string, ...string[]];

export const formSchema = z.object({
  type: z.enum(["masonry", "grid", "carousel", "slider"]),
  aspect_ratio: z.enum(BANNER_ASPECT_RATIO_VALUES).optional(),
  slides_per_view: z.number().int().min(1).max(6).optional(),
  title: z.string().optional(),
  is_active: z.boolean().optional(),
  show_on_home: z.boolean().optional(),
  category_ids: z.array(z.string()),
  shape_ids: z.array(z.string()),
});

export const bannerImageSchema = z.object({
  url: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        z.string().url().safeParse(val).success,
      { message: "Must be a valid URL" }
    ),
});
