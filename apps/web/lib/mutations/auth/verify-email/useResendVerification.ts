import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/hooks/use-toast";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

const useResendVerification = () => {
  const router = useRouter();
  const api = getApiClient();
  const mutate = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post(ENDPOINTS.AUTH.resend_verification_mail, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "success",
        type: "background",
      });
      router.replace("/login");
    },
    onError: (err: RequestError) => {
      const message = getErrorMessage(err);
      toast({
        description: message,
        variant: "destructive",
        type: "background",
      });
    },
  });
  return mutate;
};
export default useResendVerification;
