import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "../store/ui.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDelete = (tax_id: string) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.settings.taxes.remove(tax_id),
      );
      return res.data;
    },
    onSuccess: () => {
      dispatch(resetStore());
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.admin.settings.taxes.fetch_all],
      });
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
