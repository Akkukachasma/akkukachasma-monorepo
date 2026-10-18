import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/products/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/product.validation";

const useCreate = (onSuccess?: () => void) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      data.color_ids =
        (data.color_ids?.map((color_ids) => ({
          colors: color_ids,
        })) as any) || []; // We know for sure what we are doing
      const res = await api.post(ENDPOINTS.admin.products.create, data);
      return res.data;
    },
    onSuccess: () => {
      // dispatch(resetStore()); // commenting becuase we don't want to close the modal.
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["products"] });
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

export default useCreate;
