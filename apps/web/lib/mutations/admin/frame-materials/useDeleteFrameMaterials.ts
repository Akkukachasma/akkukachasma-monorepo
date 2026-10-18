import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setFrameMaterialToDelete } from "@/store/frame-materials/data.slice";

const useDeleteFrameMaterials = (onSuccess?: () => void) => {
  const frameMaterialsToDelete = useAppSelector(
    (store) => store.frameMaterialStore.dataStore.frameMaterialToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.frame_materials.delete(frameMaterialsToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setFrameMaterialToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["frame-materials"] });
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

export default useDeleteFrameMaterials;
