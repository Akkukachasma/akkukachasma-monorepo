import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPowerTypeToDelete } from "@/store/power-types/data.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeletePowerType = (onSuccess?: () => void) => {
  const powerTypeToDelete = useAppSelector(
    (store) => store.powerTypeStore.dataStore.powerTypeToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient({ multipart: true });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.power_types.delete(powerTypeToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setPowerTypeToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["power-types"] });
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

export default useDeletePowerType;
