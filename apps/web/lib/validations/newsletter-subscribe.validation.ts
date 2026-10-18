import { z } from "zod";

/** Client-side check only; backend normalizes and validates Indian mobile. */
export const newsletterSubscribeSchema = z.object({
  number: z
    .string()
    .trim()
    .min(10, { message: "Enter a valid mobile number" })
    .max(20, { message: "Number is too long" }),
});

export type NewsletterSubscribeValues = z.infer<typeof newsletterSubscribeSchema>;
