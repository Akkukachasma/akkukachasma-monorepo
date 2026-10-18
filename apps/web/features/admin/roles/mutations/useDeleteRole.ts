import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage, RequestError } from "@/lib/api";

const useDeleteRole = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(ENDPOINTS.admin.roles.delete(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({
        description: "Role deleted successfully.",
        variant: "default",
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

export default useDeleteRole;
