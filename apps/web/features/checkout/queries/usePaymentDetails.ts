import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";

const usePaymentDetails = (order_id: string) => {
  return useFetch<PaymentDetailsResponse>({
    endpoint: ENDPOINTS.payment.fetch_payment_details(order_id),
  });
};
export default usePaymentDetails;
