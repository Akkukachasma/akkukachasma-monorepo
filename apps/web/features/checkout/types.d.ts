type PaymentStatus = "pending" | "success" | "failed";
declare module "html2pdf.js";
type PaymentMode = "cod" | "online";
type OrderStatus =
  | "initiated"
  | "cancelled"
  | "confirmed"
  | "picked"
  | "delivered";

type OrderStatus =
  | "initiated"
  | "cancelled"
  | "confirmed"
  | "picked"
  | "delivered";

interface PaymentDetailsResponse {
  mode: PaymentMode;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  order_id: string;
  amount: number;
  currency: "INR";
  transaction_id: string;
  email: string;
  phone_number: string;
}
