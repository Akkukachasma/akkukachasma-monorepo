import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import {
  RequestError,
  getApiClient,
  getErrorMessage,
  isPincodeServiceabilityUnavailable,
} from "@/lib/api";
import { z } from "zod";
import { toast } from "@/lib/hooks/use-toast";
import { addressSchema } from "@/lib/validations/account.validations";

export type UpdateAddressPayload = z.infer<typeof addressSchema> & {
  id: string;
  acknowledge_unverified_pincode?: boolean;
};

const useUpdateAddress = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateAddressPayload) => {
      const res = await api.put(ENDPOINTS.account.update_address(id), data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.account.fetch_addresses],
      });
    },
    onError: (err: RequestError) => {
      if (isPincodeServiceabilityUnavailable(err)) return;
      const message = getErrorMessage(err);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
  return mutation;
};

export default useUpdateAddress;
