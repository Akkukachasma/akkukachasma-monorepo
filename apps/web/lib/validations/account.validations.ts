import { z } from "zod";

/** 4+ consecutive identical characters (e.g. "aaaa", "!!!!"). */
const REPEATED_CHAR_PATTERN = /(.)\1{3,}/;
/** At least two non-empty tokens separated by whitespace. */
const MULTI_WORD_PATTERN = /\S+\s+\S+/;

export const addressLineSchema = z
  .string()
  .min(1, "Please enter your street address")
  .refine((val) => !REPEATED_CHAR_PATTERN.test(val.trim()), {
    message: "Address cannot contain long runs of the same character",
  })
  .refine((val) => MULTI_WORD_PATTERN.test(val.trim()), {
    message:
      "Please enter a complete street address with spaces between words",
  });

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must not exceed 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"),
});

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const addressSchema = z.object({
  label: z.enum(["home", "work", "other"]).default("home"),
  notes: z.string().optional(),
  address: addressLineSchema,
  country: z.string().optional().default("India"),
  state: z.string().min(1, "Please select a state"),
  city: z.string().min(1, "Please enter a city"),
  zip_code: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
});
