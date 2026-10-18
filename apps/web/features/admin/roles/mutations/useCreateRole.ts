import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage, RequestError } from "@/lib/api";

export interface CreateRolePayload {
  name: string;
  description?: string;
  permission_ids: string[];
}

const useCreateRole = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const res = await api.post(ENDPOINTS.admin.roles.create, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({
        description: "Role created successfully.",
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

export default useCreateRole;
