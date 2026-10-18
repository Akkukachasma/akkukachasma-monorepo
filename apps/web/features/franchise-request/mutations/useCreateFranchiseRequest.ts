import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { FranchiseRequestFormValues } from "../franchise-request.schema";

const useCreateFranchiseRequest = () => {
  const api = getApiClient();
  return useMutation({
    mutationFn: async (data: FranchiseRequestFormValues) => {
      const response = await api.post(
        ENDPOINTS.franchise_request.create,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Request submitted!",
        description: "Your franchise request has been received.",
      });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        title: "Failed to submit request",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export default useCreateFranchiseRequest;
