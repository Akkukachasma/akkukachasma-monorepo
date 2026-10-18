import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { showModal } from "@/features/tryathome/store";

interface CreatePurposeData {
  label: string;
}

const useCreateTryAtHomePurpose = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: CreatePurposeData) => {
      const response = await api.post(
        ENDPOINTS.admin.tryathome.purposes.create,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Purpose created successfully!",
        variant: "success",
      });
      dispatch(showModal(false));
      queryClient.invalidateQueries({ queryKey: ["admin-tryathome-purposes"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to create purpose. Please try again.";
      toast({ description: message, variant: "destructive" });
    },
  });
};

export default useCreateTryAtHomePurpose;
