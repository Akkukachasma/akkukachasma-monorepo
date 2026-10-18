import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seo_title: z.string().min(1, "Please provide a seo friendly title."),
  meta_description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  description: z.string().min(1, "Description is required"),
});
