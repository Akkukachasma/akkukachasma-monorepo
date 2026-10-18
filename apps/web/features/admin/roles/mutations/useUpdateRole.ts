import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import { getErrorMessage, RequestError } from "@/lib/api";

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

const useUpdateRole = (id: string | null) => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateRolePayload) => {
      if (!id) throw new Error("Role ID required");
      const res = await api.patch(ENDPOINTS.admin.roles.update(id), payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-role", id] });
      toast({
        description: "Role updated successfully.",
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

export default useUpdateRole;
