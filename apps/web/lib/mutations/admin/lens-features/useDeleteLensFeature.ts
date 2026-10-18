import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLensFeatureToDelete } from "@/store/lens-features/data.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteLensFeature = (onSuccess?: () => void) => {
  const lensFeatureToDelete = useAppSelector(
    (store) => store.lensFeatureStore.dataStore.lensFeatureToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient({ multipart: true });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.lens_features.delete(lensFeatureToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setLensFeatureToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["lens-features"] });
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
