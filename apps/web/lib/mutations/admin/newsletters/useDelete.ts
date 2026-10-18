import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setItemToDelete } from "@/store/newsletters/data.slice";

const useDelete = (onSuccess?: () => void) => {
  const itemToDelete = useAppSelector(
    (store) => store.newsletterStore.dataStore.itemToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.newsletters.delete(itemToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setItemToDelete(null));
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
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
