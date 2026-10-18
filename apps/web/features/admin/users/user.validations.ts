import { z } from "zod";

export const userEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  role_ids: z.array(z.string()).min(1, "Select at least one role"),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;
