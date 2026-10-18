import { purchaseSchema } from "./purchase.schema";

interface PurchaseStore {
  step: number;
  data: z.infer<typeof purchaseSchema> | null;
}
