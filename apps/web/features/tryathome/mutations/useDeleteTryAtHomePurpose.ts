import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { setPurposeToDelete } from "@/features/tryathome/store";

const useDeleteTryAtHomePurpose = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(
        ENDPOINTS.admin.tryathome.purposes.delete(id),
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Purpose deleted successfully!",
        variant: "success",
      });
      dispatch(setPurposeToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["admin-tryathome-purposes"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to delete purpose. Please try again.";
      toast({ description: message, variant: "destructive" });
    },
  });
};

export default useDeleteTryAtHomePurpose;
