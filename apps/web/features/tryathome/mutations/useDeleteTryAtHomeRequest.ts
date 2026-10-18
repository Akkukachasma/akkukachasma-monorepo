import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

const useDeleteTryAtHomeRequest = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(
        ENDPOINTS.admin.tryathome.requests.delete(id),
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Request deleted successfully!",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-tryathome-requests"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to delete request. Please try again.";
      toast({ description: message, variant: "destructive" });
    },
  });
};

export default useDeleteTryAtHomeRequest;
