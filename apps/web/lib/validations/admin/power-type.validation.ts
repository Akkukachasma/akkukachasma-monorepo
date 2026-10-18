import { z } from "zod";
import { optionalUploadField } from "@/lib/validations/file";

export const powerTypeSchema = z.object({
  image: optionalUploadField,
  title: z.string().min(1, { message: "Please enter a title" }),
  description: z.string().min(5, {
    message: "The description should be at least 5 character long.",
  }),
});
