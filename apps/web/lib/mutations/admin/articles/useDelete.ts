import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setItemToDelete } from "@/store/articles/data.slice";

const useDelete = (onSuccess?: () => void) => {
  const itemToDelete = useAppSelector(
    (store) => store.articleStore.dataStore.itemToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.articles.delete(itemToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setItemToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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

export default useDelete;
