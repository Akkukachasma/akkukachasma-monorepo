import { z } from "zod";

export const notificationSchema = z.object({
  desktopNotification: z.boolean(),
  emailNotification: z.boolean(),
  whatsappNotification: z.boolean(),
  smsNotification: z.boolean(),
});
