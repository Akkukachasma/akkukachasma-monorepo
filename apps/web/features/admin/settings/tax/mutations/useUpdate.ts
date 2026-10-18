import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "../store/ui.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "../tax.schema";

const useUpdate = (tax_id: string) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await api.put(
        ENDPOINTS.admin.settings.taxes.update(tax_id),
        data,
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

export default useUpdate;
