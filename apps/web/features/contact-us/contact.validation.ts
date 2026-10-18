import * as z from "zod";

export const contactFormSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(1000, "Message must be less than 1000 characters"),
  source: z
    .enum(["contact_us", "product_page", "blog", "other"])
    .default("contact_us"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
