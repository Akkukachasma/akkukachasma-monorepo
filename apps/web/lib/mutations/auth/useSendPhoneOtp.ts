import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";

const useSendPhoneOtp = () => {
  const api = getApiClient();
  return useMutation({
    mutationFn: async (phone_number: string) => {
      const res = await api.post(ENDPOINTS.AUTH.phone_send_otp, { phone_number });
      return res.data;
    },
    onError: (err: RequestError) => {
      toast({
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });
};

export default useSendPhoneOtp;
