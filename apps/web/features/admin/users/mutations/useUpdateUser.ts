import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUser = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(ENDPOINTS.admin.users.update(id), data);
      return response.data.data;
    },
    onSuccess: () => {
      toast({ title: "User updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: RequestError) => {
      toast({
        title: "Failed to update user",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
};

export default useUpdateUser;
