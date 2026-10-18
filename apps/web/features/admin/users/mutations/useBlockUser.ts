import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useBlockUser = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(ENDPOINTS.admin.users.block(id));
      return response.data.data;
    },
    onSuccess: () => {
      toast({ title: "User blocked successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: RequestError) => {
      toast({
        title: "Failed to block user",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
};

export default useBlockUser;
