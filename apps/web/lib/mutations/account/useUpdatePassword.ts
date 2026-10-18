import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import { z } from "zod";
import { toast } from "@/lib/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import {
  formSchema,
  updatePasswordSchema,
} from "@/lib/validations/account.validations";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdatePassword = () => {
  const api = getApiClient();
  const params = useSearchParams();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof updatePasswordSchema>) => {
      delete (data as any).confirm_password;
      const res = await api.put(ENDPOINTS.account.update_password, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "default",
      });
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

export default useUpdatePassword;
