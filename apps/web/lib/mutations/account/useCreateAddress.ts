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

export type CreateAddressPayload = z.infer<typeof addressSchema> & {
  acknowledge_unverified_pincode?: boolean;
};

const useCreateAddress = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateAddressPayload) => {
      const res = await api.post(ENDPOINTS.account.create_address, data);
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
      // Caller shows confirm dialog for soft-unavailable; toast only other errors.
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

export default useCreateAddress;
