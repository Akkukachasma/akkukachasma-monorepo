import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";

const useApproveFranchiseRequest = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(
        ENDPOINTS.admin.franchise_requests.approve(id),
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Franchise request approved",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-franchise-requests"],
      });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error approving franchise request:", error);
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Failed to approve franchise request",
        variant: "destructive",
      });
    },
  });
};

export default useApproveFranchiseRequest;
