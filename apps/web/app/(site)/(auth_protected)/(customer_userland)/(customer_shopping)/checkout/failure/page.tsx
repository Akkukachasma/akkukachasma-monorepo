import { CheckoutFailure } from "@/features/checkout";
import CustomerHeaderWrapper from "@/features/customer/components/CustomerHeaderWrapper";
import { notFound } from "next/navigation";
import type { CheckoutResponsePageProps } from "../success/page";

const PaymentVerificationFailurePage = async ({
  searchParams,
}: CheckoutResponsePageProps) => {
  const { order_id } = await searchParams;
  if (!order_id) notFound();

  return (
    <div className="flex h-full flex-col overflow-auto">
      <CustomerHeaderWrapper title="Payment failed" className="flex-shrink-0" />
      <CheckoutFailure />
    </div>
  );
};

export default PaymentVerificationFailurePage;
