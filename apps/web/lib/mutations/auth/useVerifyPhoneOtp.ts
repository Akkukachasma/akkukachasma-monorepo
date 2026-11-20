import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import { useSearchParams } from "next/navigation";

function getRedirectPath(from: string | null): string {
  if (!from?.startsWith("/")) return "/";
  try {
    const decoded = decodeURIComponent(from);
    if (decoded.startsWith("/c/")) return decoded.slice(3);
    if (decoded === "/c") return "/";
    return decoded;
  } catch {
    return "/";
  }
}

const useVerifyPhoneOtp = () => {
  const api = getApiClient();
  const params = useSearchParams();
  const from = params.get("from");

  return useMutation({
    mutationFn: async (data: { phone_number: string; otp: string }) => {
      const res = await api.post(ENDPOINTS.AUTH.phone_verify_otp, data);
      return res.data;
    },
    onSuccess: async (data) => {
      toast({ description: data.message, variant: "default" });

      const token = data?.data?.auth_token;
      if (token) {
        window?.localStorage?.setItem(
          token.type,
          JSON.stringify({ refresh_type: token.type, life: token.life }),
        );
        try {
          const apiWithToken = getApiClient({ token: token.value ?? token });
          await apiWithToken.post(ENDPOINTS.cart.attach);
          await new Promise((r) => setTimeout(r, 100));
        } catch {
          // Don't block redirect
        }
        window.location.href = getRedirectPath(from);
      }
    },
    onError: (err: RequestError) => {
      toast({
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });
};

export default useVerifyPhoneOtp;
