import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import { z } from "zod";
import { loginSchema } from "@/lib/validations/auth.validation";
import { toast } from "@/lib/hooks/use-toast";
import { useSearchParams } from "next/navigation";

/** Normalize redirect path: decode and map legacy /c/* to current routes. */
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

const useLogin = () => {
  const api = getApiClient();
  const params = useSearchParams();
  const from = params.get("from");
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, data);
      return res.data;
    },
    onSuccess: async (data) => {
      toast({
        description: data.message,
        variant: "default",
      });

      let token: any = data?.data?.auth_token;
      if (token) {
        window?.localStorage?.setItem(
          token.type,
          JSON.stringify({ refresh_type: token.type, life: token.life }),
        );
        try {
          const api = getApiClient({
            token: token.value ?? token,
          });
          await api.post(ENDPOINTS.cart.attach);
          // Brief delay so the browser can process Set-Cookie (clear _aksid) before redirect
          await new Promise((r) => setTimeout(r, 100));
        } catch (e) {
          // Don't block redirect. Checkout will retry attach when creating order.
          console.warn("Cart attach failed:", e);
        }
        window.location.href = getRedirectPath(from);
      }
    },
    onError: (err: RequestError) => {
      const message = getErrorMessage(err);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
  return mutation;
};

export default useLogin;
