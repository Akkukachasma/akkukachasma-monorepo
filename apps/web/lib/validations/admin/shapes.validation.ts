import { z } from "zod";
import { optionalUploadField } from "@/lib/validations/file";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  seo_title: z.string().min(1, "Please provide a seo friendly title."),
  meta_description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  description: z.string().min(1, "Description is required"),
  image: optionalUploadField,
  slug: z.string().optional(),
});
