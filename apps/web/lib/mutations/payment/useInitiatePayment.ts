import {
  getApiClient,
  getErrorMessage,
  isPincodeServiceabilityUnavailable,
  RequestError,
} from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { loadRazorpay } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import usePaymentVerification from "./usePaymentVerification";
import { useRouter } from "next/navigation";

interface InitiatePaymentResponse {
  order_id: string;
  /**
   * @property Order amount in paise
   */
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  key: string;
  mode: "cod" | "online";
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export type InitiatePaymentPayload = {
  acknowledge_unverified_pincode?: boolean;
};

const useInitiatePayment = (order_id: string) => {
  const api = getApiClient();
  const router = useRouter();
  const { mutate: verifyPayment, isPending: verifying } =
    usePaymentVerification(order_id);

  const openRazorpay = async (data: InitiatePaymentResponse) => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: data.name,
      description: data.description,
      order_id: data.order_id,
      prefill: data.prefill,
      theme: data.theme,
      handler: (response: RazorpayResponse) => {
        verifyPayment(response);
      },
      modal: {
        ondismiss: () => {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled by user.",
            variant: "destructive",
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const initiateMutation = useMutation({
    mutationFn: async (payload?: InitiatePaymentPayload) => {
      const response = await api.post(ENDPOINTS.payment.make_payment, {
        order_id,
        ...(payload?.acknowledge_unverified_pincode && {
          acknowledge_unverified_pincode: true,
        }),
      });
      return response.data.data;
    },
    onSuccess: async (data: InitiatePaymentResponse) => {
      if (data.mode == "online") {
        await openRazorpay(data);
      } else {
        router.push(`/checkout/success?order_id=${data?.order_id}`);
      }
    },
    onError: (error: RequestError) => {
      if (isPincodeServiceabilityUnavailable(error)) return;
      const message = getErrorMessage(error);
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    ...initiateMutation,
    isVerifyingPayment: verifying,
  };
};
export default useInitiatePayment;
