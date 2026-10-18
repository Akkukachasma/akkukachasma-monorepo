import { PATTERNS } from "@/lib/constants";
import { z } from "zod";

export const formSchema = z.object({
  color: z
    .string({ message: "Color must be a valid string." })
    .regex(PATTERNS.hex_color, {
      message: "Please provide a valid hex color code.",
    }),
  name: z
    .string({ message: "Name must be a valid string." })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(100, { message: "Name must be at most 100 characters long." }),
});
