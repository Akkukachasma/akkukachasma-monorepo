import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";

const useDeleteFranchiseRequest = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(
        ENDPOINTS.admin.franchise_requests.delete(id),
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Franchise request deleted successfully",
      });
      // Invalidate and refetch franchise requests
      queryClient.invalidateQueries({
        queryKey: ["admin-franchise-requests"],
      });
    },
    onError: (error: any) => {
      console.error("Error deleting franchise request:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to delete franchise request",
        variant: "destructive",
      });
    },
  });
};

export default useDeleteFranchiseRequest;
