import { CheckoutSuccess } from "@/features/checkout";
import CustomerHeaderWrapper from "@/features/customer/components/CustomerHeaderWrapper";
import { notFound } from "next/navigation";

export interface CheckoutResponsePageProps {
  searchParams: Promise<{ order_id?: string }>;
}

const CheckoutSuccessPage = async ({
  searchParams,
}: CheckoutResponsePageProps) => {
  const { order_id } = await searchParams;
  if (!order_id) notFound();

  return (
    <div className="flex h-full flex-col overflow-auto">
      <CustomerHeaderWrapper title="Order placed" className="flex-shrink-0" />
      <CheckoutSuccess />
    </div>
  );
};

export default CheckoutSuccessPage;
