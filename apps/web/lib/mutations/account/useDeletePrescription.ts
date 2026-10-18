import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";

const useDeletePrescription = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ message: string }>(
        ENDPOINTS.account.remove_prescription(id),
      );
      return res.data;
    },
    onSuccess: (body) => {
      toast({ description: body.message, variant: "default" });
      void queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.account.fetch_prescriptions],
      });
    },
    onError: (err: RequestError) => {
      toast({
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });
};

export default useDeletePrescription;
