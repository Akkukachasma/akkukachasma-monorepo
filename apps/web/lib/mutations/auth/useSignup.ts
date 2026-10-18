import { useMutation } from "@tanstack/react-query";
import { signupSchema } from "@/lib/validations/auth.validation";
import { z } from "zod";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";

const useSignup = () => {
  const router = useRouter();
  const api = getApiClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof signupSchema>) => {
      // @ts-ignore
      delete data.credentials.confirm_password;
      const response = await api.post(ENDPOINTS.AUTH.SIGNUP, data);
      return response.data;
    },
    onSuccess: () => {
      toast({ description: "Account created successfully." });
      router.push("/login");
    },
    onError: (error: RequestError) => {
      toast({
        description: getErrorMessage(error) || "Something went wrong",
        variant: "destructive",
      });
    },
  });
};

export default useSignup;
