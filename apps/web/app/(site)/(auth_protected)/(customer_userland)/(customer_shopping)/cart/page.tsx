import CalculationAndCheckout from "@/components/cart/CalculationAndCheckout";
import CartItems from "@/components/cart/CartItems";
import CustomerHeaderWrapper from "@/features/customer/components/CustomerHeaderWrapper";
import PageWrapper from "@/components/wrappers/PageWrapper";

const CartPage = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <CustomerHeaderWrapper title="Shopping Cart" className="flex-shrink-0" />
      <PageWrapper className="flex flex-1 flex-col px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 lg:gap-6">
          <CartItems />
          <CalculationAndCheckout />
        </div>
      </PageWrapper>
    </div>
  );
};

export default CartPage;
