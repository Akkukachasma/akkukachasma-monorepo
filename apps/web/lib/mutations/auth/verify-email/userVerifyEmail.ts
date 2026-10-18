import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";

const useVerifyEmail = () => {
  const api = getApiClient();
  const router = useRouter();
  const mutate = useMutation({
    mutationKey: ["verifyEmail"],
    mutationFn: async (token: string) => {
      const res = await api.post(ENDPOINTS.AUTH.verify_email(token));
      return res.data;
    },
    onSuccess: () => {
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
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
export default useVerifyEmail;
