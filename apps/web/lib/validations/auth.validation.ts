import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
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
    path: ["confirm_password"], // path of error
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  remember_me: z.boolean().default(false),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must not exceed 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"),
  credentials: z
    .object({
      password: z
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
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }),
  agree_t_and_c: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export const ResendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your Email address")
    .email("Please enter a valid Email address"),
});
