import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUnblockUser = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(ENDPOINTS.admin.users.unblock(id));
      return response.data.data;
    },
    onSuccess: () => {
      toast({ title: "User unblocked successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: RequestError) => {
      toast({
        title: "Failed to unblock user",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
};

export default useUnblockUser;
