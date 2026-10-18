import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLensDetailToDelete } from "@/store/lens-details/data.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteLensFeature = (onSuccess?: () => void) => {
  const lensDetailToDelete = useAppSelector(
    (store) => store.lensDetailStore.dataStore.lensDetailToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient({ multipart: true });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.lens_details.delete(lensDetailToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setLensDetailToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["lens-details"] });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        variant: "destructive",
        description: message,
      });
    },
  });
  return mutation;
};

export default useDeleteLensFeature;
