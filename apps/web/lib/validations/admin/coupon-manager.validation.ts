import dayjs, { errorMessages, isValidDate } from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter coupon name" }),
  valid_from: z
    .string()
    .refine((date: string): boolean => isValidDate(date), {
      message: errorMessages.invalidDate,
    })
    .refine(
      (date: string): boolean => {
        const inputDate: Dayjs = dayjs(date);
        const maxDate: Dayjs = dayjs().add(1, "year");
        return inputDate.isSameOrBefore(maxDate);
      },
      {
        message: errorMessages.futureLimit,
      },
    ),

  valid_till: z.string().refine((date: string): boolean => isValidDate(date), {
    message: errorMessages.invalidDate,
  }),
  minimum_order: z
    .number({ message: "Provided value should be a number" })
    .min(1, "Please provide a valid number"),
  per_user_limit: z
    .number({ message: "Provided value should be a number" })
    .min(1, "User should be able to use at least once"),
  quantity: z
    .number({ message: "Quantity value should be a number" })
    .min(0, "Quantity cannot be negative"),
  discount_type: z.enum(["FIXED", "PERCENT"], {
    message: "Discount type must be one of FIXED or PERCENT",
  }),
  discount_value: z
    .number({ message: "Discount value should be a number" })
    .min(0.01, "Discount value should not be less than 0.01"),
});
