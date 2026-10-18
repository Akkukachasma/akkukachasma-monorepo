import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useToast } from "@/lib/hooks/use-toast";
import { resetPasswordSchema } from "@/lib/validations/auth.validation";
import { useMutation } from "@tanstack/react-query";
import z from "zod";

const useResetPassword = (token: string) => {
  const { toast } = useToast();
  const api = getApiClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof resetPasswordSchema>) => {
      const { new_password } = data;
      const response = await api.put(ENDPOINTS.AUTH.reset_password(token), {
        new_password,
      });
      return response.data;
    },
    onSuccess: (response) => {
      toast({
        title: "Password Reset Successful",
        description: response.message,
        variant: "success",
      });
      window.location.href = "/login";
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        title: "Password Reset Failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export default useResetPassword;
