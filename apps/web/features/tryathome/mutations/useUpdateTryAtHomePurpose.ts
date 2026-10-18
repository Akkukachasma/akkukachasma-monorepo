import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { setPurposeToEdit, showModal } from "@/features/tryathome/store";

interface UpdatePurposeData {
  id: string;
  label: string;
}

const useUpdateTryAtHomePurpose = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: UpdatePurposeData) => {
      const response = await api.put(
        ENDPOINTS.admin.tryathome.purposes.update(data.id),
        { label: data.label },
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Purpose updated successfully!",
        variant: "success",
      });
      dispatch(setPurposeToEdit(null));
      dispatch(showModal(false));
      queryClient.invalidateQueries({ queryKey: ["admin-tryathome-purposes"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update purpose. Please try again.";
      toast({ description: message, variant: "destructive" });
    },
  });
};

export default useUpdateTryAtHomePurpose;
