import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RazorpayResponse } from "./useInitiatePayment";

const usePaymentVerfication = (order_id: string) => {
  const router = useRouter();
  const api = getApiClient();
  return useMutation({
    mutationFn: async (data: RazorpayResponse) => {
      const response = await api.post(ENDPOINTS.payment.verify_payment, {
        ...data,
        order_id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/checkout/success?order_id=${order_id}`);
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      // here we should redirect the user to payment failure page along with the message.
      router.push(`/checkout/failure?order_id=${order_id}&message=${message}`);
    },
  });
};
export default usePaymentVerfication;
