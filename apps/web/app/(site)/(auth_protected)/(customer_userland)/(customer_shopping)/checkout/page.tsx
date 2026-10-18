import OrderItems from "@/components/checkout/OrderItems";
import OrderSummary from "@/components/checkout/OrderSummary";
import ProceedToPay from "@/components/checkout/ProceedToPay";
import SelectAddress from "@/components/checkout/select-address";
import MobileNumberAlert from "@/components/checkout/MobileNumberAlert";
import CustomerHeaderWrapper from "@/features/customer/components/CustomerHeaderWrapper";
import { Separator } from "@/components/ui/separator";
import { CheckoutProvider } from "@/features/checkout";

const CheckoutPage = () => {
  return (
    <CheckoutProvider>
      <div className="flex h-full min-h-0 flex-col overflow-auto">
        <CustomerHeaderWrapper
          title="Checkout"
          tagline="Complete your order with 100% safety"
          className="flex-shrink-0"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 md:pb-6">
          <MobileNumberAlert />
          <div className="mt-4 grid flex-1 grid-cols-1 gap-6 md:grid-cols-12 md:gap-8 lg:gap-10">
            <OrderItems />
            <div className="flex min-w-0 flex-col gap-4 md:col-span-5 lg:col-span-6">
              <OrderSummary />
              <Separator className="my-2 md:my-4" />
              <SelectAddress />
              <Separator className="my-2 md:my-4" />
              <ProceedToPay />
            </div>
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
};

export default CheckoutPage;
